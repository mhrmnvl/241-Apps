# Data Model: Separate the student surface from the management surface

**Date**: 2026-08-14 · **Plan**: [plan.md](plan.md)

**No schema migration is required.** Every row this feature reads already
exists; what changes is who may read which subset, and by what path. The one
data change is to grants — which permissions the student role holds — and that
is rows in `role_permissions`, not a new table or column.

---

## Entities the feature depends on

### Permission (existing)

The catalogue is code-defined (`SYSTEM_PERMISSIONS`) and upserted into the
`permissions` table. Five codes are added:

| Code | Grants the right to read |
|---|---|
| `students.read-own` | one's own student record |
| `report-cards.read-own` | one's own published report cards |
| `student-scores.read-own` | one's own marks |
| `attendances.read-own` | one's own attendance days and totals |
| `schedules.read-own` | one's own schedule — a student's classroom timetable, or a teacher's teaching schedule |

Naming follows the existing convention: plural module segment, dotted action,
`-own` suffix as `leave-requests.read-own` already does. None carries a
bypass-exempt prefix (research D3).

### Role → Permission grant (existing rows, changed contents)

The student role's grants move:

| Before | After |
|---|---|
| `students.read` | `students.read-own` |
| `attendances.read` | `attendances.read-own` |
| `report-cards.read` | `report-cards.read-own` |
| — | `student-scores.read-own` |
| — | `schedules.read-own` |

The first three are the exposure. The last two are additions: a student could
not previously reach their marks or their timetable at all through a permission
of their own, which is why two of the four menu entries lead to screens that
would refuse them even after scoping.

Teaching roles gain `schedules.read-own` so a teacher can be shown their own
teaching schedule (User Story 3). Which role that is belongs to the school —
the grant is made through the role screen, not hardcoded.

### Student record (existing)

`students.userId → users.id`. This is the link that answers "whose record is
this request about", and it is the signal the feature uses instead of a role
name. `IStudentRepository.findByUserId` already exposes it, returning
`{ id } | null`; a null means an empty result, never a wider one.

### Teaching record (existing)

`teachers.userId → users.id`, via `ITeacherRepository.findByUserId`. Same
contract: absent means the person has no teaching schedule, not that they may
see everyone's.

### Enrolment (existing)

`student_enrollments` ties a student to a classroom within a semester. It is
what makes "my classroom" answerable without asking the student to choose, and
what scopes their schedule and attendance to the right period. Reads fall back
to the active semester when none is supplied, per Principle III.

### Report card (existing)

`report_cards.enrollmentId → student_enrollments.id`, carrying `isPublished`.
The self-service read adds two conditions the management read does not have:
the enrolment must belong to the caller, and `isPublished` must be true
(FR-005). Both are applied by the system, not by a caller-supplied filter.

---

## Scoping rules, stated once

These are the rules the implementation must apply identically everywhere, and
which the contract tests assert:

1. **Identity is applied last.** The caller's resolved `studentId` (or
   `teacherId`) overrides anything of the same meaning in the query. In the
   established shape: `execute({ ...query, studentId: resolved })`, never the
   reverse.
2. **No record means empty, never wide.** A caller holding a `-own` permission
   with no student record receives an empty result. It must not fall through to
   an unscoped read.
3. **Group-shaped reads are refused, not narrowed.** A recap or a trend
   describes a cohort. A `-own` caller asking for one is refused (FR-003); their
   own totals come from their own rows instead (research, open question).
4. **Period defaults to active.** Where the caller supplies no semester, the
   active one is resolved rather than reading across years.
5. **Published only.** A `-own` report-card read never returns a draft.

---

## What is deliberately *not* modelled

- **No `isStudent` flag on the session.** The frontend already declares
  `SessionUser.student` and `SessionUser.teacher`, and nothing has ever
  populated them; the only reader (`useAcademicInfo.ts:57`) has therefore always
  bailed out. Those two fields are removed rather than filled, and screens are
  offered by permission instead (research D5).
- **No new join table between a user and "their" records.** The links exist
  (`students.userId`, `teachers.userId`); adding a cache of them would create a
  second source for one fact.
- **No parent/guardian model.** Out of scope per the spec's assumptions, and it
  needs its own answer to which guardian may see which child.
