---
description: 'Task list for feature 004-reduce-overfetching'
---

# Tasks: Fetch Only What Is Shown

**Input**: Design documents from `/specs/004-reduce-overfetching/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/)

**Tests**: The spec asks for no behaviour change, so the existing 1,914 backend and 235 frontend tests are the regression net. New tests appear only where behaviour is new — the reference cache's expiry and single-flight rules (US3).

**Organization**: Grouped by user story. US1 is shippable on its own and is the suggested MVP.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel — different files, no dependency on an incomplete task
- **[Story]**: US1–US4, mapping to the user stories in spec.md

## Path Conventions

Monorepo: `backend/src/…` for the API, `apps/<app>/src/…` for the five frontends, `packages/<pkg>/src/…` for shared code.

---

## Phase 1: Setup

**Purpose**: Establish what "better" will be measured against, and finish the inventory the plan deliberately left open.

- [ ] T001 Capture request count and total transferred for the six screens in [quickstart.md](./quickstart.md) Step 1, and write them to `specs/004-reduce-overfetching/baseline.md`
- [ ] T002 [P] Record the size of one student row and one teacher row from the list responses in `specs/004-reduce-overfetching/baseline.md`
- [X] T003 [P] Enumerate every view that fetches a `PAGINATION.REFERENCE_LIMIT` list in `onMounted` but reads it only inside a dialog, and append the list to `specs/004-reduce-overfetching/baseline.md` under "Dialog-only reads"

**Checkpoint**: The numbers exist. Nothing after this can be judged without them.

---

## Phase 2: Foundational (Blocking)

**Purpose**: The three shapes every later backend task references. Blocks US1 and US4.

- [X] T004 Create `backend/src/shared/domain/prisma-selects.ts` exporting `PROFILE_NAME_SELECT`, `PROFILE_DISPLAY_SELECT` and `PROFILE_ROSTER_SELECT` per [data-model.md](./data-model.md), each with `satisfies Prisma.ProfileDefaultArgs`, and a file comment stating which to use when
- [X] T005 Verify `PROFILE_DISPLAY_SELECT` carries the `avatarFile: { select: { storageKey: true } }` relation and not `avatarFileId`, since `withAvatarUrl` derives the signed URL from the storage key

**Checkpoint**: The shapes compile and are importable. No call site uses them yet.

---

## Phase 3: User Story 1 — Personal data stops travelling where it is not shown (P1) 🎯 MVP

**Goal**: No read pulls a personal field the screen does not display. Covers FR-001 to FR-004.

**Independent test**: Open any list showing names and confirm the data leaving the database holds the name and only what the screen draws. Sign in and confirm only identity, roles and permissions are read.

### Name-only sites — parallel, one file each

- [X] T006 [P] [US1] Replace `profile: true` with `PROFILE_NAME_SELECT` in `backend/src/academic/schedule/infrastructure/persistence/prisma-schedule.includes.ts`
- [X] T007 [P] [US1] Replace `profile: true` with `PROFILE_NAME_SELECT` in `backend/src/academic/attendance/infrastructure/persistence/prisma-attendance.includes.ts`
- [X] T008 [P] [US1] Replace both `profile: true` occurrences with `PROFILE_NAME_SELECT` in `backend/src/academic/assessment/infrastructure/persistence/prisma-assessment.includes.ts`
- [X] T009 [P] [US1] Replace all five `profile: true` occurrences with `PROFILE_NAME_SELECT` in `backend/src/academic/classroom/infrastructure/persistence/prisma-classroom.includes.ts`, covering the supervisor include and the four structure roles
- [X] T010 [P] [US1] Replace `profile: true` with `PROFILE_NAME_SELECT` in `backend/src/academic/graduation/infrastructure/persistence/prisma-graduation.includes.ts`
- [X] T011 [P] [US1] Replace `profile: true` with `PROFILE_NAME_SELECT` in `backend/src/academic/report-card/infrastructure/persistence/prisma-report-card.includes.ts`
- [X] T012 [P] [US1] Replace `profile: true` with `PROFILE_NAME_SELECT` in `backend/src/academic/teaching-assignment/infrastructure/persistence/prisma-teaching-assignment.includes.ts`
- [X] T013 [P] [US1] Replace `profile: true` with the fields the admission screens actually read in `backend/src/admission/infrastructure/persistence/prisma-admission.includes.ts`, checking `apps/admission/src` first rather than assuming name-only

### Roster sites — read more than a name, handle with care

- [X] T014 [US1] Replace `profile: true` with `PROFILE_ROSTER_SELECT` in `backend/src/academic/student/infrastructure/persistence/prisma-student.includes.ts`, then confirm the gender column in `apps/academic/src/features/academic/student/components/columns.ts` still populates
- [X] T015 [US1] Replace `profile: true` inside `USER_SELECT` with `PROFILE_ROSTER_SELECT` in `backend/src/academic/teacher/infrastructure/persistence/prisma-teacher.includes.ts`, then confirm the NIK and gender columns in `apps/academic/src/features/academic/teacher/components/columns.ts` still populate
- [X] T016 [US1] Replace `profile: true` with `PROFILE_ROSTER_SELECT` in `backend/src/academic/enrollment/infrastructure/persistence/prisma-enrollment.includes.ts`, then confirm the gender column in `apps/academic/src/features/academic/classroom/components/enrollment-columns.ts` and the gender shown in `AddStudentDialog.vue` still populate

### Session identity

- [X] T017 [US1] Replace `profile: true` with `PROFILE_DISPLAY_SELECT` in `findUserById` in `backend/src/platform/auth/infrastructure/persistence/prisma-auth.repository.ts`, leaving the role and permission tree unchanged
- [X] T018 [P] [US1] Replace `profile: true` with `PROFILE_NAME_SELECT` in `backend/src/platform/auth/infrastructure/persistence/prisma-auth.includes.ts`
- [X] T019 [US1] Confirm `GET /auth/me` returns exactly the same body as before, since `GetProfileUseCase` already maps to identity, roles and permissions only

### Verification

- [X] T020 [US1] Confirm `grep -rn "profile: true" backend/src --include=*.ts` returns nothing outside `platform/profile` (which US4 handles)
- [X] T021 [US1] Run `pnpm --filter backend test`, `typecheck` and `lint:strict`; all must pass unchanged
- [ ] T022 [US1] Walk [quickstart.md](./quickstart.md) Step 2 by eye: gender on the student list, NIK and gender on the teacher list, gender in Tambah Siswa, and the avatar in every app's header

**Checkpoint**: Shippable on its own. Every list reads a name; three lists read the two extra columns they show; sign-in reads nothing it does not need.

---

## Phase 4: User Story 2 — Pages stop loading lists nobody asked for (P2)

**Goal**: Dialog-only data loads when the dialog opens. Covers FR-006.

**Independent test**: Open an affected page with the Network tab open and confirm the dialog's list is absent; open the dialog and confirm it arrives then.

- [X] T023 [US2] Move the `subjectApi.getSubjects({ limit: REFERENCE_LIMIT })` call out of `fetchReferenceData` in `apps/academic/src/features/academic/curriculum-subject/services/curriculumSubjectService.ts` so it is no longer invoked from the view's `onMounted`
- [X] T024 [US2] Fetch the subject list inside `apps/academic/src/features/academic/curriculum-subject/components/AddCurriculumSubjectDialog.vue` when `open` becomes true, showing a loading state until it resolves
- [X] T025 [US2] Remove `fetchReferenceData()` from the `onMounted` in `apps/academic/src/features/academic/curriculum-subject/views/CurriculumSubjectView.vue`
- [X] T026 [P] [US2] Apply the same move to each remaining view identified by T003, one commit per view
- [X] T027 [US2] Confirm each converted dialog handles a failed fetch by saying so and offering a retry, without affecting the page behind it, per [contracts/read-projections.md](./contracts/read-projections.md) C4

**Checkpoint**: Opening a page no longer transfers data belonging to a dialog that was never opened.

---

## Phase 5: User Story 3 — Reference data is not re-downloaded on every page (P2)

**Goal**: A rarely-changing list is retrieved once per visit. Covers FR-009 to FR-011.

**Independent test**: Navigate Kelas → Kurikulum → Penugasan Mengajar → Kehadiran and confirm each shared list is requested once, not four times.

### The store

- [X] T028 [US3] Create `packages/platform/src/features/reference-data/stores/referenceDataStore.ts` holding `CachedList` entries per [data-model.md](./data-model.md), with `key`, `items`, `fetchedAt` and `status`
- [X] T029 [US3] Implement read-through, single-flight and bounded staleness in `packages/platform/src/features/reference-data/composables/useReferenceList.ts` per [contracts/read-projections.md](./contracts/read-projections.md) C3
- [X] T030 [US3] Implement per-list expiry from the table in [data-model.md](./data-model.md), and invalidation on write
- [X] T031 [US3] Clear the store on sign-out by hooking `authService.logoutUser` in `packages/platform/src/features/auth/services/authService.ts`
- [X] T032 [US3] Export the composable and store from `packages/platform/src/features/reference-data/index.ts`

### Tests — this is new behaviour, so it is tested

- [X] T033 [P] [US3] Test in `packages/platform/src/features/reference-data/composables/useReferenceList.spec.ts` that a second read inside the expiry window issues no request
- [X] T034 [P] [US3] Test that two simultaneous reads of a cold list issue exactly one request
- [X] T035 [P] [US3] Test that a read after the expiry window issues a fresh request
- [X] T036 [P] [US3] Test that invalidating a list causes the next read to refetch, and that sign-out empties the store

### Adoption, one screen at a time

- [X] T037 [US3] Read academic years, semesters, classrooms and teachers through the cache in `apps/academic/src/features/academic/classroom/views/ClassroomManageView.vue`, and collapse its two sequential `Promise.all` blocks into one where the second does not depend on the first
- [X] T038 [P] [US3] Read the shared reference lists through the cache in `apps/academic/src/features/academic/teaching-assignment/views/TeachingAssignmentView.vue`
- [X] T039 [P] [US3] Read the shared reference lists through the cache in `apps/academic/src/features/academic/attendance/views/AttendanceView.vue`
- [X] T040 [P] [US3] Read the shared reference lists through the cache in `apps/academic/src/features/academic/rapor/views/RaporView.vue`

**Checkpoint**: Navigating between four pages requests each shared list once.

---

## Phase 6: User Story 4 — Adding a field stops breaking unrelated screens (P3)

**Goal**: Reads state what they need, so a schema change ripples nowhere. Covers FR-005, FR-007, FR-012.

**Independent test**: Add a scratch column to the personal record, regenerate, and confirm no screen changes and no response carries it.

- [ ] T041 [US4] Split `USER_DETAIL_SELECT` in `backend/src/platform/profile/infrastructure/persistence/prisma-profile.includes.ts` into an identity read plus conditional teacher and student reads, per [data-model.md](./data-model.md)
- [ ] T042 [US4] Compose the three reads in `backend/src/platform/profile/infrastructure/persistence/prisma-profile.repository.ts` so `findDetailByUserId` returns a body byte-identical to the current one
- [X] T043 [US4] Replace the depth-six `profile: true` on the classroom supervisor branch with `PROFILE_NAME_SELECT`, since only the wali kelas's name is shown
- [ ] T044 [US4] Compare the `GET /profiles/me` response before and after T041–T043 for the same user and confirm they match field for field
- [X] T045 [P] [US4] Separate `STUDENT_LIST_INCLUDE` from `STUDENT_DETAIL_INCLUDE` in `backend/src/academic/student/infrastructure/persistence/prisma-student.includes.ts` so the list carries strictly less
- [X] T046 [P] [US4] Separate `USER_SELECT` into list and detail variants in `backend/src/academic/teacher/infrastructure/persistence/prisma-teacher.includes.ts`, dropping `createdAt` and `updatedAt` from the list
- [X] T047 [P] [US4] Add `where: { deletedAt: null }` to the `curricula` include in `backend/src/academic/grade/infrastructure/persistence/prisma-grade-academic-year.includes.ts`, and replace the bare `grade`/`academicYear` includes with explicit selects
- [X] T048 [US4] Add a scratch column to `Profile` in `backend/prisma/profile.prisma`, run `prisma:generate` and `typecheck`, confirm no response carries it, then remove the column without migrating it
- [X] T049 [US4] Record the projection rules in `CLAUDE.md` and `backend/docs/NESTJS-RULES.md`: every read touching a person uses one of the three shapes, `profile: true` is a defect, and a screen needing more states it at the call site

**Checkpoint**: A schema change is safe, and the rule is where the next person will find it.

---

## Phase 7: Polish

- [ ] T050 Re-measure the six screens from T001 and record the results beside the baseline in `specs/004-reduce-overfetching/baseline.md`
- [ ] T051 Confirm SC-002 to SC-004 against the two sets of numbers, and note any criterion that did not move and why
- [ ] T052 [P] Run the full gate: `pnpm typecheck`, `pnpm lint`, `pnpm lint:strict`, `pnpm format:check`, `pnpm test`, `pnpm build`, and `pnpm --filter backend validate`
- [ ] T053 [P] Update `docs/prisma_repository_audit.md` and `docs/api_fetching_audit.md` to mark the findings this feature closed, and to correct the two that were wrong

---

## Dependencies

```text
Phase 1 (Setup)
   └─> Phase 2 (Foundational: the three shapes)
          ├─> Phase 3 (US1)  ──> Phase 6 (US4)   [US4's T041–T043 reuse the shapes]
          └─> Phase 6 (US4)
Phase 4 (US2)  — independent, frontend only
Phase 5 (US3)  — independent, frontend only
All ──> Phase 7 (Polish)
```

**Story independence**:

- **US1** needs Phase 2. Nothing else.
- **US2** needs only T003 from Setup. It can start immediately and ship before US1.
- **US3** is independent of every backend task.
- **US4** needs Phase 2, and T045 touches the same file as T014 (US1), so those two are sequential.

## Parallel Opportunities

- **Setup**: T002 and T003 together.
- **US1**: T006–T013 and T018 are eight different files with no shared symbols — all parallel. T014–T016 are also separate files but each needs a visual check, so run them parallel and verify serially.
- **US3**: T033–T036 are four independent test cases; T038–T040 are three different views.
- **US4**: T045, T046 and T047 are separate files.
- **Across stories**: one person on US1 (backend) and one on US2 then US3 (frontend) never touch the same file.

## Implementation Strategy

**MVP is US1 alone.** It closes the widest finding, reduces how far personal data travels, and needs nothing from the other three stories. Ship it, then decide whether the rest is worth continuing.

**Suggested order**: Phase 1 → Phase 2 → US1 → ship → US2 → US3 → US4 → Polish.

**Commit granularity**: one commit per file in US1, so a wrongly applied shape is reverted alone rather than with thirteen siblings.

**The failure mode to watch**: applying a name-only shape to one of the three roster sites blanks a column with no error. T014–T016 exist as separate, individually verified tasks for exactly that reason.
