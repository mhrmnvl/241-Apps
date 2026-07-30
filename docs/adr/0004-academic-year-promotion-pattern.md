# ADR-0004: Academic Year Promotion, Rollover, and Graduation Pattern

**Status:** Accepted  
**Date:** 2026-07-30  
**Deciders:** Engineering Team

---

## Context

The `academic` module tracks students across multiple academic years through `Classroom`, `Semester`, `StudentEnrollment`, and `Student` entities. When a new academic year begins, three actions must happen:

1. Students move between grade levels (promotion/repeat)
2. Students who finish the highest grade become alumni (graduation)
3. The transition within the same academic year across semesters is handled separately (rollover)

This ADR documents the chosen patterns and their invariants, as well as the reasoning behind two specific decisions: blocking deactivation of academic years with active enrollments, and keeping `Student.gradeId` in sync during promotion.

---

## Decision

### 1. Two distinct transition operations

| Operation | Scope | Use case |
|---|---|---|
| **Rollover** (`RolloverSemesterUseCase`) | Within the same `AcademicYear` | Semester 1 → Semester 2 of the same year. Copies classrooms, enrollments, supervisors, teaching assignments, and schedules to the target semester. |
| **Promotion** (`PromoteStudentsUseCase`) | Across different `AcademicYear`s | End-of-year kenaikan kelas. Each student is assigned one of three actions. |

Attempting rollover across academic years, or promotion within the same academic year, throws `BadRequestException`. The error messages explicitly redirect to the correct operation.

### 2. Three promotion actions

| Action | Effect on old enrollment | Effect on student |
|---|---|---|
| `PROMOTE` | status → `PROMOTED`, `endedAt` set | New `ACTIVE` enrollment in a higher-level classroom in the new AY. `Student.gradeId` updated to target classroom's `gradeId`. |
| `REPEAT` | status → `REPEATED`, `endedAt` set, `note` = decline reason | New `ACTIVE` enrollment in the same-level classroom in the new AY. `Student.gradeId` updated (same value). `declineReason` is required. |
| `GRADUATE` | status → `GRADUATED`, `endedAt` set | `Student.status` → `GRADUATED`. `StudentGraduation` record created. No new enrollment. |

### 3. `Student.gradeId` is kept in sync with the current grade level

`Student.gradeId` is a denormalized field that reflects the student's current grade level (e.g., class 7, 8, 9) — not the specific classroom. It is updated at:

- **Student creation** (`CreateStudentUseCase`) — set from the `gradeId` in the payload
- **Bulk import** (`BulkImportStudentUseCase`) — resolved from the grade name
- **Promotion/Repeat** (`PrismaPromotionRepository.executePromotion`) — updated to `targetClassroom.gradeId` after creating the new enrollment
- **Graduation** — not updated; `Student.status = GRADUATED` takes precedence

**Rationale:** The `StudentListView` and `StudentAccountsView` frontends use `Student.gradeId` as the primary value for the "Tingkat" (grade level) filter and display column. Although there is a fallback (`row.gradeId ?? row.enrollments?.[0]?.classroom?.gradeId`), relying on the fallback means that filtering by grade level would silently break for any student who has been promoted but whose `gradeId` was not updated. Keeping `gradeId` in sync avoids this silent inconsistency.

### 4. Deactivating an `AcademicYear` with active enrollment data is blocked

`DeactivateAcademicYearUseCase` throws `BadRequestException` if `hasRelatedData` returns `true` (i.e., there are non-deleted `StudentEnrollment` records in any semester of that academic year).

**Rationale:** Deactivating an academic year that still has active enrollments would:
- Break `EnsureStudentEnrollmentUseCase`, which relies on finding an `activeSemester`
- Leave enrollments in an inconsistent state (assigned to a semester/classroom under an inactive AY)
- Prevent `PromoteStudentsUseCase` from working correctly (source AY becomes ambiguous)

The operator must either complete the promotion cycle or bulk-drop/transfer all remaining enrollments before deactivating.

---

## Consequences

### Positive
- Enrollment data integrity is guaranteed across academic year transitions
- `Student.gradeId` is always accurate for the current academic year, making frontend filtering reliable without fallback
- Clear separation between in-year transitions (rollover) and cross-year transitions (promotion)

### Negative / Trade-offs
- Operators cannot "force" deactivate an academic year with stale enrollment data; they must resolve enrollments first
- Promotion is an O(n) operation per student (one `classroom` lookup + one `student` update per PROMOTE/REPEAT row); acceptable for typical school sizes but worth monitoring for very large imports

### Neutral
- `StudentGraduation.studentId` is `@unique` — a student can only have one graduation record. If a student is re-enrolled after graduation (edge case), the existing graduation record blocks a second `GRADUATE` action; the operator must delete the graduation record manually.

---

## Related ADRs

- [ADR-0002](./0002-student-enrollment-direct-call.md) — Direct call pattern for student enrollment (no event bus)
- [ADR-0003](./0003-no-transaction-across-student-enrollment-writes.md) — No distributed transaction across enrollment writes
