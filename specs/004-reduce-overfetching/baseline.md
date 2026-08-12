# Baseline: Fetch Only What Is Shown

**Feature**: `004-reduce-overfetching` | **Started**: 2026-08-12

---

## Request counts and payload sizes (T001, T002)

**Not captured.** These need a browser with the Network tab against a running
stack, which the implementing agent did not have. Until they exist, SC-002 to
SC-004 cannot be judged — they are all expressed as "fewer than before".

Capture them per [quickstart.md](./quickstart.md) Step 1 **before** starting
US2's remaining work, and record them here:

| # | Screen | Path | Requests | Transferred |
|---|---|---|---|---|
| B1 | Student list | `/data/student` | | |
| B2 | Teacher list | `/data/teacher` | | |
| B3 | Schedule | `/schedule` | | |
| B4 | Classroom manage | `/academic/classroom/:id/manage` | | |
| B5 | Curriculum subject | `/academic/curriculum/:id/subject` | | |
| B6 | Cold-start sign-in | `/login` → dashboard | | |

Row sizes for B1 and B2:

| Screen | Bytes per row (before) | Bytes per row (after) |
|---|---|---|
| Student list | | |
| Teacher list | | |

> The US1 work has already landed, so a baseline captured now measures the
> remaining stories only. The US1 reduction can still be shown by checking out
> the commit before `4abb5cc` and measuring there.

---

## Dialog-only reads (T003)

Views that fetch a reference list on mount and bind it to nothing but a dialog.
Found by matching every `*Dialog` / `*Sheet` binding against how often the
identifier appears in the view at all, then reading each mount body to confirm
the fetch is eager.

| # | View | List | Fetched by | Bound only to | Status |
|---|---|---|---|---|---|
| D1 | `curriculum-subject/views/CurriculumSubjectView.vue` | subjects (1,000) | `fetchReferenceData()` | `AddCurriculumSubjectDialog` | **Done** — the dialog loads it itself |
| D2 | `classroom/views/ClassroomView.vue` | grades | `fetchGrades()` | `ClassroomFormDialog` | Open |
| D3 | `classroom/views/ClassroomManageView.vue` | grades, academicYears | `fetchGrades()`, `fetchAcademicYears()` | `ClassroomFormDialog` | Open |
| D4 | `semester/views/SemesterView.vue` | academicYears | `fetchAcademicYears()` | the semester form dialog | Open |
| D5 | `teacher/views/TeacherListView.vue` | positions | `fetchPositions()` | `TeacherFormDialog` | Open |

**Note on D2 and D3**: both bind `grades` into the same `ClassroomFormDialog`.
Making that dialog fetch for itself changes both parents at once, so they are
one unit of work, not two.

**Not on this list, and why**: `ClassroomManageView`'s `academicYears` is also
read by the view's own filter control, so it is not dialog-only there;
`fetchAvailableStudents` is already lazy, which is the audit finding that turned
out to be wrong. The student and teacher creation wizards fetch step-4 reference
data on step 1 — real waste, but a wizard step is not a dialog, so it belongs to
the reference cache (US3) rather than to US2.

**Scope of the scan**: `apps/academic/src/features/academic/*/views/*.vue`. The
other four applications were not scanned; the audits covered academic only.
