# Tasks: Separate the student surface from the management surface

**Feature**: `005-student-self-service` · **Plan**: [plan.md](plan.md) · **Spec**: [spec.md](spec.md)

**Date**: 2026-08-14

## Format: `[ID] [P?] [Story] Description`

- **[P]** — may run in parallel with other `[P]` tasks in the same phase: different files, no dependency on anything still open.
- **[US1/US2/US3]** — the user story the task serves. Setup, Foundational and Polish carry no story label.

## Path Conventions

Backend paths are relative to `backend/`, frontend paths to the repository root.
Backend imports carry the `.js` extension even on `.ts` sources (NodeNext ESM).

---

## Phase 1: Setup (Shared Infrastructure)

- [X] T001 Add the five self-service codes to `backend/src/platform/access-control/permission/constants/permission-codes.constants.ts`: `students.read-own`, `report-cards.read-own`, `student-scores.read-own`, `attendances.read-own`, `schedules.read-own`. Keep entries in the file's existing module order and give each a description that says *own* explicitly, e.g. "Read your own report cards".
- [X] T002 Make the catalogue reach a database nobody seeds: have `backend/src/platform/access-control/permission/permission.module.ts` run `SyncPermissionsUseCase` on application bootstrap (`OnApplicationBootstrap`), keeping `POST /permissions/sync` as it is. Log the count of codes upserted at info level so a deploy leaves evidence.
- [ ] T003 [P] Add a spec at `backend/src/platform/access-control/permission/use-cases/sync-permissions.bootstrap.spec.ts` asserting the sync runs on bootstrap and is idempotent — running it twice leaves the same rows.
- [X] T004 Move the student role's grants in `backend/prisma/seeds/modules/iam.seed.ts` from `students.read`, `attendances.read`, `report-cards.read` to `students.read-own`, `attendances.read-own`, `report-cards.read-own`, `student-scores.read-own`, `schedules.read-own`. Leave a comment saying why the wide codes are gone, naming the reads they opened.

**Checkpoint**: The permission catalogue contains the new codes on any box that has booted the new build, and a freshly seeded database grants a student only self-service.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: One way for an academic module to ask "which student record belongs to this account", so four modules do not each invent it.

**⚠️ Blocks every user story below.**

- [X] T005 Define the port at `backend/src/academic/student/domain/interfaces/student-identity-read.port.ts`: an abstract class `IStudentIdentityReadPort` with `findStudentIdByUserId(userId: string): Promise<string | null>`. Follow the shape of `src/presence/daily-record/domain/interfaces/daily-presence-read.port.ts`, including a doc comment stating what the consumer sees and nothing more.
- [X] T006 Implement it at `backend/src/academic/student/infrastructure/persistence/prisma-student-identity.read-port.ts`, selecting `id` only, scoped `deletedAt: null`. It must return null rather than throw when the account has no student record.
- [X] T007 Export the port from `backend/src/academic/student/student.module.ts` so consumers bind the abstraction, never the Prisma class.
- [X] T008 [P] Define and implement the teacher counterpart — `ITeacherIdentityReadPort.findTeacherIdByUserId` — in `backend/src/academic/teacher/`, mirroring T005–T007. Needed by User Story 3 and by `GET /schedules/me`.
- [X] T009 [P] Add `backend/src/academic/student/domain/interfaces/student-identity-read.port.spec.ts` asserting the implementation returns null for an unknown account and for a soft-deleted student, since "no record" is the case that must never fall through to a wide read.

**Checkpoint**: Any academic module can resolve a caller to a student or teacher id through an injected abstraction.

---

## Phase 3: User Story 1 — A student can only ever read their own record (Priority: P1) 🎯 MVP

**Goal**: A student holding only the self-service permissions cannot obtain another person's academic data by any route, filter or identifier.

**Independent test**: Grant a test account the five `-own` codes and nothing else. Every read in `contracts/self-service-reads.md` returns that student's own rows or refuses; repeating each with a second student's identifier changes nothing.

### Tests for User Story 1

Written first: each asserts a refusal or a narrowing that does not exist yet.

- [ ] T010 [P] [US1] Contract test at `backend/src/academic/report-card/presentation/report-card.self-service.spec.ts` — `/rapors/me` returns only the caller's rows; a foreign `studentId` in the query changes nothing; an unpublished card of the caller's is absent; `/rapors/me/:id` for another student's card answers 404, not 403.
- [ ] T011 [P] [US1] Contract test at `backend/src/academic/assessment/presentation/student-score.self-service.spec.ts` — `/student-scores/me` scoping, non-widenable, and assessments with no mark still listed.
- [ ] T012 [P] [US1] Contract test at `backend/src/academic/attendance/presentation/attendance.self-service.spec.ts` — `/academic/attendances/me` scoping and own totals; `recap` and `recap/trend` refuse a caller holding only `attendances.read-own`.
- [ ] T013 [P] [US1] Contract test at `backend/src/academic/schedule/presentation/schedule.self-service.spec.ts` — `/schedules/me` answers from the caller's records: classroom timetable for a student, teaching schedule for a teacher, both for someone who is both, empty for neither.
- [ ] T014 [P] [US1] Test at `backend/src/academic/student/presentation/student.self-service.spec.ts` — a caller holding `students.read-own` cannot reach `GET /students`, and `GET /students/:id` still refuses another student's id.
- [ ] T015 [P] [US1] Sweep at `backend/src/academic/shared/no-ignored-caller.spec.ts` — no academic controller may inject `@CurrentUser()` and then not pass it to its use case. Strip comments first; assert the sweep fires on the shape it looks for. This is the guard that would have caught the original defect, where the parameter was present and named `_user`.

### Implementation for User Story 1

- [ ] T016 [US1] Add `studentId` to `ReportCardQueryInput` handling in `backend/src/academic/report-card/use-cases/get-report-cards.use-case.ts` as a *use-case argument*, not a DTO field, and apply it after the caller's query: `{ ...query, studentId: resolved }`. Reversing that order lets a caller override their own identity.
- [ ] T017 [US1] Add `GET /rapors/me` and `GET /rapors/me/:id` to `backend/src/academic/report-card/presentation/report-card.controller.ts`, guarded by `report-cards.read-own`, both **declared before** the existing `@Get(':id')` so `me` is never parsed as a uuid. Force `isPublished: true` in the use case, not the query.
- [ ] T018 [US1] Add `GET /student-scores/me` to `backend/src/academic/assessment/presentation/student-score.controller.ts` guarded by `student-scores.read-own`, scoped through the port, declared before `@Get(':id')`.
- [ ] T019 [US1] Add `GET /academic/attendances/me` to `backend/src/academic/attendance/presentation/attendance.controller.ts` guarded by `attendances.read-own`, returning the caller's days plus their own totals. Declare it before `@Get(':id')` and beside the existing `suggestions` route, which already carries the ordering note.
- [ ] T020 [US1] In `backend/src/academic/attendance/presentation/attendance.controller.ts`, leave `@Get('recap')` and `@Get('recap/trend')` on `attendances.read` — a cohort read is refused to a self-service caller rather than narrowed (FR-003). Add a comment at each saying so, so a later reader does not "fix" it by adding the `-own` code.
- [ ] T021 [US1] Add `GET /schedules/me` to `backend/src/academic/schedule/presentation/schedule.controller.ts` guarded by `schedules.read-own`, resolving student and teacher records server-side and returning both when the caller has both.
- [ ] T022 [US1] Bind the ports in `backend/src/academic/report-card/report-card.module.ts`, `backend/src/academic/assessment/assessment.module.ts`, `backend/src/academic/attendance/attendance.module.ts` and `backend/src/academic/schedule/schedule.module.ts` — importing `StudentModule` for `IStudentIdentityReadPort`, and additionally `TeacherModule` in schedule for `ITeacherIdentityReadPort`. Import the `.module.js` file directly, never through a feature barrel, or the ESM cycle crashes boot.
- [ ] T023 [US1] In `backend/src/academic/student/presentation/student.controller.ts`, stop the `_user` parameter from being a silent omission: either use it or remove it, and record in a comment that `GET /students` is a roster read reachable only with `students.read`.
- [ ] T023b [US1] Regression test at `backend/src/academic/report-card/presentation/report-card.management-unchanged.spec.ts` — the same fixtures through `GET /rapors` with `report-cards.read` return what they return today, including `meta.summary`. FR-007 and SC-005 otherwise rest on the gate being green, and a green gate is not evidence that a management response kept its shape.
- [ ] T024 [US1] Add a data migration `backend/prisma/migrations/<timestamp>_student_role_self_service_grants/migration.sql` that, for any role holding all three of `students.read`, `attendances.read`, `report-cards.read` **and** named by code `STUDENT`, replaces those grants with the five `-own` codes. Guard every statement so it is a no-op where the role does not exist — which is both databases today — and say so in the header.

**Checkpoint**: The exposure is closed and provable. The four student menu entries now fail honestly (FR-008); nothing shows foreign data. Safe to stop here.

---

## Phase 4: User Story 2 — A student sees their own record on screens built for them (Priority: P2)

**Goal**: Four screens that answer a student's questions about themselves, with no control that writes.

**Independent test**: Sign in as a student and visit each entry under *Akademik Saya*; each renders that student's own data, shows a plain empty state where there is none, and offers nothing that writes.

### Tests for User Story 2

- [ ] T025 [P] [US2] Service test at `apps/academic/src/features/academic/rapor/__tests__/myRaporService.spec.ts` — the self-service read stores what the endpoint returns and does not fall back to the management list on failure.
- [ ] T026 [P] [US2] Service test at `apps/academic/src/features/academic/attendance/__tests__/myAttendanceService.spec.ts` — own totals come from the response, never recomputed from a page.

### Implementation for User Story 2

Each view lands **inside the existing feature folder** for its domain, beside the management view, as `presence/leave` holds `LeaveApprovalView.vue` and `MyLeaveView.vue`.

- [ ] T027 [P] [US2] Add `getMine` to `apps/academic/src/features/academic/rapor/api/raporApi.ts` and a `fetchMine` to its service; type the response with the existing `RaporListMeta` so the summary keeps its meaning.
- [ ] T028 [P] [US2] Add the equivalent to `apps/academic/src/features/academic/attendance/`, `.../student-score/` and `.../schedule/` api and service layers.
- [ ] T029 [US2] Create `apps/academic/src/features/academic/rapor/views/MyRaporView.vue` — the caller's published report card with its subject lines. No generate, publish, delete or export-for-others control is present, not merely disabled (FR-010).
- [ ] T030 [P] [US2] Create `apps/academic/src/features/academic/attendance/views/MyAttendanceView.vue` — own days and own totals, no classroom picker.
- [ ] T031 [P] [US2] Create `apps/academic/src/features/academic/student-score/views/MyScoreView.vue` — own marks per assessment, including assessments with no mark yet, so what is outstanding is visible.
- [ ] T032 [P] [US2] Create `apps/academic/src/features/academic/schedule/views/MyScheduleView.vue` — the caller's own timetable, no classroom picker.
- [ ] T033 [US2] Add routes for the four views in each feature's `routes.ts`, each carrying its `-own` permission in `meta.requiredPermission`. **The four paths must be new**: every URL the student menu points at today is owned by a management route — `/academic/student-score` belongs to the *assessment-item* feature's list, `/academic/attendance` to `AttendanceView`, `/academic/report-card` to `RaporView`, `/schedule` to `ScheduleView`. Use `/academic/my/schedule`, `/academic/my/attendance`, `/academic/my/scores`, `/academic/my/report-card`, and leave the existing paths pointing where they point.
- [ ] T034 [US2] Repoint the four entries in `apps/academic/src/config/menuConfig.ts` (`key: 'student-view'`) at the four new paths from T033, and give each a `requiredPermission` of the matching `-own` code so the section is offered by permission rather than by `allowedRoles: ['STUDENT']`.
- [ ] T035 [US2] Write the empty states as separate cases in `MyRaporView.vue`, `MyAttendanceView.vue`, `MyScoreView.vue` and `MyScheduleView.vue`: not enrolled this semester, no marks entered yet, report card exists but is unpublished. Each says which it is; none says "no data".

**Checkpoint**: The student surface is complete and useful. Safe to stop here.

---

## Phase 5: User Story 3 — A teacher's own schedule survives a role the school invented (Priority: P3)

**Goal**: What the schedule screen shows follows from permissions and records, never from a role's name.

**Independent test**: Give a teaching account a school-created role carrying the same permissions, sign in, and see that person's own teaching schedule.

- [ ] T036 [P] [US3] Test at `apps/academic/src/features/academic/schedule/__tests__/useSchedule.spec.ts` — with `schedules.read-own` the personal view is offered; with `schedules.read` the classroom picker; with both, both; and none of it depends on the role array.
- [ ] T037 [US3] Remove `isStudent` and `isTeacher` from `apps/academic/src/features/academic/schedule/composables/useSchedule.ts:28-29` and drive the affordances from `can('schedules.read-own')` and `can('schedules.read')` instead.
- [ ] T038 [US3] Delete the `student` and `teacher` fields from `packages/platform/src/features/auth/types/session.ts` — nothing has ever populated them, and their only reader bails out on the `undefined` they always held.
- [ ] T039 [US3] Fix that reader: `apps/academic/src/features/academic/academic-info/composables/useAcademicInfo.ts:57` reads `user.student.classroomId` and returns early. Point it at `GET /schedules/me`, which resolves the classroom server-side, so today's schedule renders for the first time.
- [ ] T040 [US3] Add a sweep at `apps/academic/src/__tests__/no-role-name-branching.spec.ts` asserting no file under `apps/academic/src/features` compares a role to a literal. The sanctioned exceptions — the router's SUPER_ADMIN bypass and the menu's `allowedRoles` — are named explicitly rather than pattern-excluded, so adding a new one is a deliberate edit.

**Checkpoint**: No screen decides what to show from a role's name.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T041 [P] Update `backend/docs/NESTJS-RULES.md` with the self-service rule: a `-own` permission plus a `.../me` route declared before its `:id` sibling, and identity applied after the caller's query, never before.
- [ ] T042 [P] Note in `docs/environments.md` that a deploy now syncs the permission catalogue on boot, so a new code needs no manual step.
- [ ] T043 Run the full gate on both sides — `pnpm --filter backend validate`, then `pnpm lint && pnpm typecheck && pnpm test && pnpm build` — and confirm by exit code, not by reading output.
- [ ] T044 Work through `quickstart.md` by hand on dev, including the negative checks: the foreign-identifier attempts, and looking for a write control on each student screen.

---

## Dependencies

```
Phase 1 (Setup)  ──┐
                   ├──► Phase 2 (Foundational) ──► Phase 3 (US1) ──► Phase 4 (US2) ──► Phase 5 (US3) ──► Phase 6
                   │                                    ▲
                   └────────────────────────────────────┘
```

- **Phase 2 blocks everything**: every scoped read resolves the caller through the port.
- **US1 is independent** of US2 and US3 and ships alone.
- **US2 depends on US1** for the endpoints its screens call.
- **US3 depends on US1** for `GET /schedules/me`, and touches files US2 does not.
- T024 (the grants migration) can land with US1 or after; it is a no-op on both current databases.

## Parallel opportunities

- **Phase 2**: T008 (teacher port) runs beside T005–T007 (student port).
- **Phase 3 tests**: T010–T015 are six files, no shared state — all parallel.
- **Phase 3 implementation**: T016–T021 touch five different modules and can proceed in parallel once Phase 2 lands; T022 joins them.
- **Phase 4 views**: T030, T031, T032 are three separate files. T029 is listed without `[P]` because it is the one that also settles the shared shape the other three copy.
- **Phase 6**: T041 and T042 are documentation and parallel.

## Implementation strategy

**MVP is Phase 1 + 2 + 3.** That closes the exposure without a single new screen
and leaves the system strictly safer than today. It is the slice worth
promoting on its own, and everything after it is additive.

Ship in three commits matching the three stories, in order. Each goes to `dev`,
waits for *Deploy to Development*, and is verified there before the next one
starts — six earlier fixes are already queued on `dev` and this work sits on top
of them without reordering.

## Format validation

All 44 tasks carry a checkbox, a sequential id, a story label where the phase
requires one, and a concrete file path. Setup, Foundational and Polish tasks
carry no story label by design.
