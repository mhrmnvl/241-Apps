# Baseline and results: Fetch Only What Is Shown

**Feature**: `004-reduce-overfetching` | **Started**: 2026-08-12 | **Measured**: 2026-08-12

---

## How these numbers were taken

Not from a browser. They were measured **at the Prisma layer, read-only**,
against the live database (167 users, 118 students, 48 teachers) by running the
before-shape and the after-shape of each query for the same rows and comparing
the serialised JSON.

That is stricter than a Network-tab reading for what this feature changes:

- It isolates the response body from transfer encoding, so a compression
  setting cannot flatter the result.
- It compares the *same rows*, so a differently sized page cannot flatter it
  either.
- The before-shapes were recovered from `fb09b52`, the commit before the first
  change, rather than reconstructed from memory.

Nothing was written. No login, no session, no migration — reads only.

**Request counts are derived from the code**, by reading each screen's mount
path in `fb09b52` and at `85edd7a`. This is exact for API calls, where a browser
count would also include assets and be a fraction harder to attribute.

---

## Response size (T002, T050)

One page of ten rows, the size the list screens request.

| Screen | Bytes/row before | Bytes/row after | Page before | Page after | Reduction |
|---|---|---|---|---|---|
| Student list | 1,764 | 1,482 | 17,636 | 14,816 | **−16.0%** |
| Teacher list | 904 | 517 | 9,039 | 5,174 | **−42.8%** |

The student row falls less because most of its weight is enrolments, classrooms
and semesters — the person was never the bulk of it. The teacher row is nearly
halved because the person *was*.

`GET /profiles/me`, same user, before and after:

| Person | Before | After | Reduction |
|---|---|---|---|
| A student | 4,409 | 3,543 | **−19.6%** |
| A teacher | 63,625 | 63,625 | 0% |

The teacher's profile does not shrink and should not: nothing in that response
was over-fetched once the branch split landed. What changed for them is the
*number of queries*, not the bytes — see T044 below. (63 KB is dominated by the
permission tree under `userRoles`, which is out of scope here and worth its own
look.)

---

## Requests per screen (T001, T050)

"Cold" is the first visit after sign-in; "warm" is a return visit within the
list expiry.

| # | Screen | Before | After (cold) | After (warm) |
|---|---|---|---|---|
| B1 | Student list | 3 | 3 | 3 |
| B2 | Teacher list | 3 | 2 | 2 |
| B3 | Schedule | 1 | 1 | 1 |
| B4 | Classroom manage | 8, in two waves (6 then 2) | 8, in two waves (1 then 7) | **5, in one wave** |
| B5 | Curriculum subject | 3 | **2** | 2 |
| B6 | Cold-start sign-in | 2 | 2 | 2 |

Notes, because three of these rows are easy to misread:

- **B1 does not improve, on purpose.** Both of its reference reads are
  parameterised — classrooms by `gradeId` and `isActive`, grades by `isActive`.
  Caching them under a flat key is exactly the collision the contract forbids:
  two filters would share one entry and serve each other's rows.
- **B4's cold count is unchanged but its shape is not.** Before, six requests
  had to finish before two more could start, though only the semester was
  actually needed. Now the semester resolves alone and the other seven go
  together. Warm, the semester is already held, so it is one wave of five.
- **B6's count is unchanged; its payload is not.** `GET /auth/me` runs on every
  cold start of all five applications and used to read the whole profile row.

---

## The profile response, field by field (T044)

The one change that had to be verified rather than argued: `GetProfileUseCase`
spreads the repository row straight into the response, so splitting the query
could have altered the body silently.

Both shapes were run for the same user and diffed by path.

**A teacher**: `0` differences. Byte-identical. Key order identical.

**A student**: key order identical, and **27 differences, every one of them
inside the homeroom-teacher branch**. Nothing outside it changed.

All 27 are fields the frontend never reads. `packages/platform/.../profile.ts`
declares exactly `semesterId` and `teacher.user.profile.name` for that branch.
What is now absent:

| Group | Fields |
|---|---|
| Supervisor join row | `id`, `classroomId`, `teacherId`, `deletedAt` |
| The teacher's employment | `nip`, `nuptk`, `employmentTypeId`, `deletedAt` |
| The teacher's account | **`passwordHash`**, `lastLoginAt`, `createdAt`, `updatedAt`, `deletedAt` |
| The teacher's person | `id`, `userId`, `nik`, `gender`, `birthPlace`, `birthDate`, `email`, `phone`, `religionId`, `bloodTypeId`, `maritalStatus`, `noKk`, `npwp`, `avatarFileId` |

**This is wider than the credential.** Every student opening their own profile
was receiving their homeroom teacher's national ID, date and place of birth,
personal email, phone number, family card number and tax number — alongside the
bcrypt hash. The hash is the part that reads as an incident; the rest is the
part that would have been hard to notice.

---

## Success criteria (T051)

| Criterion | Verdict | Evidence |
|---|---|---|
| **SC-002** — a list carries fewer bytes per row | **Met** | −16.0% student, −42.8% teacher, same rows |
| **SC-003** — a screen issues fewer requests | **Met, narrowly** | B2 3→2, B5 3→2, B4 8→5 warm. B1 and B3 unchanged, and B1 deliberately so |
| **SC-004** — no screen loses a value it displayed | **Met** | Gender, NIK and name populate 10/10 on both lists; the profile diff is confined to fields the frontend does not declare |

**Not claimed**: wall-clock page load. It was not measured, it depends on the
network between the school and Neon, and nothing here would let me state it
honestly.

---

## Visual check (T022)

Asked of the data rather than the eye, which is the stronger form of the
question — a column is empty because the field is absent, and absence is
checkable:

| Field | Student list | Teacher list |
|---|---|---|
| `name` | 10/10 populated | 10/10 |
| `gender` | 10/10 | 10/10 |
| `nik` | 10/10 | 10/10 |

The selected profile keys are exactly `['name', 'gender', 'nik']` on both — the
roster projection, nothing more and nothing missing.

Avatars are not on these two screens; `PROFILE_DISPLAY_SELECT` carries the
`avatarFile` relation rather than `avatarFileId`, which is checked by
`prisma-selects.ts`'s comment and by `withAvatarUrl` failing to compile
otherwise.

---

## Dialog-only reads (T003)

Views that fetched a reference list on mount and bound it to nothing but a
dialog. Found by matching every `*Dialog` / `*Sheet` binding against how often
the identifier appears in the view at all, then reading each mount body.

| # | View | List | Status |
|---|---|---|---|
| D1 | `curriculum-subject/views/CurriculumSubjectView.vue` | subjects (1,000) | **Done** — the dialog loads it itself |
| D2 | `classroom/views/ClassroomView.vue` | grades | **Done** |
| D3 | `classroom/views/ClassroomManageView.vue` | grades, academicYears | **Done** |
| D4 | `semester/views/SemesterView.vue` | academicYears | **Done** |
| D5 | `teacher/views/TeacherListView.vue` | positions | **Done** |

D2 and D3 both bind `grades` into the same `ClassroomFormDialog`, so making
that dialog fetch for itself changed both parents at once.

**Not on this list, and why**: `ClassroomManageView`'s `academicYears` is also
read by the view's own filter control, so it was not dialog-only there;
`fetchAvailableStudents` was already lazy, which is the audit finding that
turned out to be wrong. The student and teacher creation wizards fetch step-4
reference data on step 1 — real waste, but a wizard step is not a dialog.

**Scope of the scan**: `apps/academic/src/features/academic/*/views/*.vue`. The
other four applications were not scanned; the audits covered academic only.

---

## Cache key collisions — checked, none found

The one way this cache can serve wrong data is two callers writing one key with
different parameters. All eleven read sites were listed and compared: every one
passes exactly `{ limit: PAGINATION.REFERENCE_LIMIT }`, unfiltered.

The two reads that would have collided are the two left uncached, and that is
why they were left: `studentService.fetchClassrooms` filters by `gradeId` and
`isActive`, and the assignable-subject list is narrowed by the active
curriculum.
