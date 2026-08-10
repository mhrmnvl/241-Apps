---
description: "Task list for QR Card Attendance, Leave & Payroll"
---

# Tasks: QR Card Attendance, Leave & Payroll

**Input**: Design documents from `/specs/002-qr-attendance-payroll/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Revision**: renumbered 2026-08-10 by the `/speckit-analyze` remediation pass. A third
ordering defect of the same kind surfaced during US1 implementation and is recorded at T117:
`work-pattern` had to be created in US1, not US4, because `DayStatusService` cannot decide
what counts as late without it and Principle VI forbids reaching into another module's
tables. That makes three modules whose story phase disagreed with their first consumer —
the pattern is worth watching in US5 and US6. Five tasks
were added and two dependency-ordering defects fixed — the `daily-record` module is now
created in US1 where its first consumer lives, and the `attendance-period` module moved to
Foundational because US2, US4, and US6 all depend on it.

**Tests**: Test tasks are **mandatory here**, not optional. Constitution Principle V states
"New backend use cases MUST ship with a `*.spec.ts` — this is the codebase's established
practice (243 backend specs today), not a new demand." Every backend use-case task below
therefore delivers the use case **and its spec as one unit of work**; they are not split
into separate tasks because they are not separable deliverables under this repo's rules.

**Organization**: grouped by user story so each is independently implementable and testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallelizable — different files, no dependency on an incomplete task
- **[Story]**: US1–US6, mapping to the user stories in spec.md
- Every task names its exact file path

## Path Conventions

Monorepo (plan.md § Project Structure):

- Backend: `backend/src/presence/`, `backend/src/payroll/`, `backend/prisma/`
- Frontend: `apps/academic/src/features/presence/`, `apps/academic/src/features/payroll/`
- Backend layering per module: `presentation/`, `use-cases/`, `domain/`, `infrastructure/`,
  `dto/`, `constants/`, `<name>.module.ts`, `index.ts`
- NodeNext ESM — every relative import carries `.js`

---

## Phase 1: Setup (Decisions & Dependencies)

**Purpose**: record the architectural decisions this feature requires *before* code depends
on them. The constitution requires all three; none is optional.

- [X] T001 Create branch `002-qr-attendance-payroll` from `main` (repo is currently on `main`; no git extension hook exists to do this)
- [X] T002 [P] Write `docs/adr/0007-presence-domain.md` — new `presence/` domain, keyed on `userId`, the `academic/ → presence/` edge, and credential validity as the expected-days window; follow ADR-0001..0006 format (Context, Decision, Considered Options, Consequences)
- [X] T003 [P] Write `docs/adr/0008-narrow-admin-bypass-payroll.md` — `payroll-` joins `ROLE_BYPASS_EXEMPT_PREFIXES`; cite ADR-0006 as precedent
- [X] T004 Amend `.specify/memory/constitution.md` 1.1.0 → 1.2.0 in `docs/adr`-consistent terms: name `payroll-` in Principle III's exemption list and add the Sync Impact Report entry. Leave the Compliance Baseline re-survey to T213 — it cannot be honest until the code exists (depends on T002, T003)
- [X] T005 [P] Add `qrcode` to dependencies and `@types/qrcode` to devDependencies in `apps/academic/package.json`, then run `pnpm install` from the repo root — the package ships no bundled types and `lint:strict` would otherwise fail

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: schema, permissions, guards, the shared period module, and module registration
that every story needs.

**⚠️ CRITICAL**: no user story work can begin until this phase completes.

### Database schema

- [X] T006 Create `backend/prisma/presence.prisma` with the **8 enums** and 14 models from data-model.md, including every `@@unique`, `@@index`, and `@@map`
- [X] T007 Create `backend/prisma/payroll.prisma` with the 4 enums and 5 models from data-model.md; money columns are `Decimal @db.Decimal(15, 2)`
- [X] T008 Run `pnpm --filter backend prisma:migrate` and confirm the generated SQL is **purely additive** — no `ALTER` on `attendances`, `students`, `teachers`, or `academic_calendars` (FR-022 enforced structurally)

### Permissions and the role bypass

- [X] T009 Append the **30** `presence-*`, `work-patterns`, `non-working-days`, `leave-types`, `leave-requests` permission codes to `backend/src/platform/access-control/permission/constants/permission-codes.constants.ts` per contracts/permissions.md — count the table rows, not the prose
- [X] T010 Append the 12 `payroll-*` permission codes to `backend/src/platform/access-control/permission/constants/permission-codes.constants.ts`, bringing the registry to 244 (sequential after T009 — same file, will conflict if parallelised)
- [X] T011 Add `'payroll-'` to `ROLE_BYPASS_EXEMPT_PREFIXES` in `backend/src/platform/access-control/permission/guards/permission.guard.ts:25`
- [X] T012 Extend `backend/src/platform/access-control/permission/guards/permission.guard.spec.ts` — assert `ADMIN` is denied a `payroll-*` permission and still allowed a `presence-*` one, and that `SUPER_ADMIN` passes both
- [X] T013 Update `backend/prisma/seeds/modules/iam.seed.ts` so `ADMIN` receives every permission **except** codes prefixed `portal-` or `payroll-`

### Seeds

- [X] T014 [P] Create `backend/prisma/seeds/modules/work-pattern.seed.ts` — the default pattern (Mon–Thu & Sat 07:00–14:00, Fri 07:00–11:30, Sun non-working, 10-minute grace) with its seven `WorkPatternDay` rows
- [X] T015 [P] Create `backend/prisma/seeds/modules/leave-type.seed.ts` — IZIN, SAKIT, CUTI_TAHUNAN (quota), DINAS_LUAR (treatment `OFFICIAL_DUTY`)
- [X] T016 Register both seeds in `backend/prisma/seeds/index.ts` and `backend/prisma/seed.ts` (sequential — shared files)

### Shared presence infrastructure

- [X] T017 [P] Create `backend/src/presence/shared/constants/presence.constants.ts` — duplicate-scan suppression window (60 s), max offline window (8 h), max batch size (500)
- [X] T018 Create `backend/src/presence/shared/services/server-clock.service.ts` and its spec — issues clock anchors and validates a device-derived `occurredAt` against the offline window (research R3)
- [X] T019 Create `backend/src/presence/shared/decorators/device-auth.decorator.ts` — the `@DeviceAuth()` metadata marker, modelled on `@PortalPublic()`
- [X] T020 Create `backend/src/presence/shared/guards/device.guard.ts` and its spec — resolves a bearer token to an active `PresenceDevice` by hash comparison, and short-circuits `JwtAuthGuard` for marked routes (research R7)
- [X] T021 Create `backend/src/presence/shared/presence-shared.module.ts` exporting the clock service and guard

### Attendance period — foundational because three stories depend on it

- [X] T022 Create `backend/src/presence/attendance-period/` complete: `domain/entities/attendance-period.entity.ts`, `domain/interfaces/attendance-period-repository.interface.ts`, `infrastructure/persistence/prisma-attendance-period.repository.ts`, `use-cases/get-attendance-periods.use-case.ts` with its spec, `attendance-period.module.ts`, and `index.ts` exporting the port. **US2 refuses edits inside a closed period, US4 closes one, and US6 refuses to run against an open one** — it cannot live in any single story's phase

### Module registration

- [X] T023 Create `backend/src/presence/presence.module.ts` skeleton importing `PresenceSharedModule` and `AttendancePeriodModule`
- [X] T024 Create `backend/src/payroll/payroll.module.ts` skeleton
- [X] T025 Register `PresenceModule` and `PayrollModule` in `backend/src/app.module.ts` (import the `.module.js` files directly, never a barrel)

### Frontend scaffolding

- [X] T026 [P] Create `apps/academic/src/features/presence/` with per-feature directories and empty `index.ts` barrels for `kiosk`, `credential`, `device`, `employee-attendance`, `work-pattern`, `leave`, `leave-type`
- [X] T027 [P] Create `apps/academic/src/features/payroll/` with barrels for `component`, `assignment`, `run`, `payslip`
- [X] T028 Verify the foundation: `pnpm --filter backend prisma:generate`, `pnpm --filter backend typecheck`, and `pnpm --filter academic-web typecheck` all green

**Checkpoint**: schema, permissions, guards, the period module, and domain modules exist.
User story work can begin.

---

## Phase 3: User Story 1 — Scan a card at the gate (Priority: P1) 🎯 MVP

**Goal**: a student or employee scans a card at the gate and the day is recorded, with
on-screen confirmation, duplicate suppression, rejection handling, and offline survival.

**Independent Test**: issue one student card and one employee card, register one device, scan
each on arrival and departure, and confirm both people have a dated record with arrival,
departure, and an on-time/late determination. Confirm an unissued card is rejected by reason,
and that scans taken while the backend is stopped arrive intact when it restarts.
(quickstart.md Scenarios 1 and 2.)

### Credential module — `backend/src/presence/credential/`

- [X] T029 [P] [US1] Create `domain/entities/credential.entity.ts` and `domain/interfaces/credential-repository.interface.ts` (`ICredentialRepository` + Input types), including a `findValidOnDate(userId, date)` contract — credential validity is what makes a day expected (FR-011, research R1)
- [X] T030 [US1] Create `infrastructure/persistence/prisma-credential.repository.ts` and `prisma-credential.where.ts` — every query filters `deletedAt: null`; the validity predicate follows the replacement chain so a reissued card leaves no gap
- [X] T031 [US1] Create `constants/credential.constants.ts` — code byte length (16 → 128 bits) and alphabet
- [X] T032 [US1] Create `services/credential-code.service.ts` and its spec — opaque URL-safe random token generation; assert it encodes no personal data and is not sequential (research R12)
- [X] T033 [US1] Create `use-cases/issue-credential.use-case.ts` and its spec — rejects with `ConflictException` when an active credential exists for the user
- [X] T034 [US1] Create `use-cases/revoke-credential.use-case.ts` and its spec — requires a reason, stamps `revokedAt`, never frees the code for reuse
- [X] T035 [US1] Create `use-cases/replace-credential.use-case.ts` and its spec — revoke + issue in one same-module transaction, setting `replacedById`; the spec must assert attendance history stays continuous across the replacement (FR-002)
- [X] T036 [US1] Create `use-cases/get-credentials.use-case.ts` and `use-cases/get-credential-by-id.use-case.ts` with specs — responses **must not** include `code`
- [X] T037 [US1] Create `use-cases/get-credentials-for-print.use-case.ts` and its spec — the only read that returns `code`
- [X] T038 [US1] Create `dto/request/` and `dto/response/` DTOs, one per file, with class-validator and Swagger decorators
- [X] T039 [US1] Create `presentation/credential.controller.ts` — thin, `@RequirePermissions('presence-credentials.*')`, explicit return types per contracts/presence-api.md
- [X] T040 [US1] Create `credential.module.ts` and `index.ts` barrel (exports the port and response DTOs only — never the Module class)

### Device module — `backend/src/presence/device/`

- [X] T041 [P] [US1] Create `domain/entities/device.entity.ts` and `domain/interfaces/device-repository.interface.ts`
- [X] T042 [US1] Create `infrastructure/persistence/prisma-device.repository.ts`
- [X] T043 [US1] Create `services/device-token.service.ts` and its spec — generate, hash, and constant-time verify; assert the plaintext is never persisted
- [X] T044 [US1] Create `use-cases/register-device.use-case.ts` and `use-cases/rotate-device-token.use-case.ts` with specs — each returns the plaintext token exactly once
- [X] T045 [US1] Create `use-cases/get-devices.use-case.ts`, `update-device.use-case.ts`, `delete-device.use-case.ts` with specs — list exposes `lastSeenAt`, never `tokenHash`
- [X] T046 [US1] Create `dto/request/` and `dto/response/` DTOs
- [X] T047 [US1] Create `presentation/device.controller.ts`
- [X] T048 [US1] Create `device.module.ts` and `index.ts`

### Daily record module — `backend/src/presence/daily-record/`

- [X] T049 [P] [US1] Create `domain/entities/daily-presence.entity.ts`, `domain/interfaces/daily-presence-repository.interface.ts`, and `domain/interfaces/daily-presence-read.port.ts` (`IDailyPresenceReadPort` per contracts/internal-ports.md)
- [X] T050 [US1] Create `infrastructure/persistence/prisma-daily-presence.repository.ts`, `.where.ts`, and `.includes.ts` — keep the class under the 200-line budget
- [X] T051 [US1] Create `services/work-pattern-resolver.service.ts` and its spec — resolve the pattern in force for a user and date, falling back to the `isDefault` pattern and recording which won (FR-024)
- [X] T052 [US1] Create `services/day-status.service.ts` and its spec — derive `status`, `lateMinutes`, and `earlyLeaveMinutes` from check-in/out against the resolved pattern and grace period. **`NOT_EXPECTED` has three causes and the spec must cover all three**: a `NonWorkingDay`, a `WorkPatternDay` with `isWorkingDay = false`, or no valid credential on that date (FR-011). Only when all three are excluded may an empty day become `ABSENT`. Also cover check-out without check-in
- [X] T053 [US1] Create `daily-record.module.ts` and `index.ts` providing the daily-presence repository and both services, exporting the repository port — **US1's scan path injects this, so the module cannot wait for US2**

### Scan module — `backend/src/presence/scan/`

- [X] T054 [P] [US1] Create `domain/entities/scan.entity.ts` and `domain/interfaces/scan-repository.interface.ts`
- [X] T055 [US1] Create `infrastructure/persistence/prisma-scan.repository.ts` — append-only, no soft delete
- [X] T056 [US1] Create `constants/scan.constants.ts` re-exporting the shared windows from `presence/shared/constants/`
- [X] T057 [US1] Create `use-cases/record-scan.use-case.ts` and its spec — **the core**: resolve code → credential, reject unknown/revoked/inactive/stale, suppress duplicates inside the window, write the scan, then create or update the day's `DailyPresence`, then touch `lastSeenAt`. Spec must cover all six `ScanOutcome` values and both check-in and check-out
- [X] T058 [US1] Create `use-cases/record-scan-batch.use-case.ts` and its spec — processes in `occurredAt` order, returns a per-`clientEventId` result, and returns the original outcome for an already-seen id (research R4, R11)
- [X] T059 [US1] Create `use-cases/get-clock-anchor.use-case.ts` and its spec — returns server time, anchor id, and the max offline window
- [X] T060 [US1] Create `use-cases/get-scans.use-case.ts` and its spec — the evidence log, including rejections (FR-003)
- [X] T061 [US1] Create `dto/request/record-scan.dto.ts`, `record-scan-batch.dto.ts`, `scan-query.dto.ts`, and the response DTOs
- [X] T062 [US1] Create `presentation/scan.controller.ts` — `@DeviceAuth()` on ingest and clock routes; rejections return 201 with an outcome, never an HTTP error (contracts/presence-api.md)
- [X] T063 [US1] Create `scan.module.ts` and `index.ts`
- [X] T064 [US1] Wire `CredentialModule`, `DeviceModule`, `DailyRecordModule`, and `ScanModule` into `backend/src/presence/presence.module.ts`

### Frontend — kiosk, cards, devices

- [X] T065 [P] [US1] Create `features/presence/credential/api/credentialApi.ts` and `types/index.ts`
- [X] T066 [US1] Create `features/presence/credential/services/credentialService.ts` and `stores/credentialStore.ts`
- [X] T067 [US1] Create `features/presence/credential/views/CredentialListView.vue`, `components/IssueCredentialDialog.vue`, and `components/columns.ts`
- [X] T068 [US1] Create `features/presence/credential/views/CardPrintSheet.vue` — renders QR via `qrcode`, laid out for A4 card printing; the code appears only here and in the issue response
- [X] T069 [P] [US1] Create `features/presence/device/api/deviceApi.ts`, `types/index.ts`, and `services/deviceService.ts`
- [X] T070 [US1] Create `features/presence/device/views/DeviceListView.vue` and `components/RegisterDeviceDialog.vue` — the one-time token is shown with an explicit "this is the only time you will see it" warning and a copy action
- [X] T071 [P] [US1] Create `features/presence/kiosk/api/kioskApi.ts` and `types/index.ts`
- [X] T072 [US1] Create `features/presence/kiosk/composables/useScanQueue.ts` — IndexedDB queue, per-`clientEventId` acknowledgement, flush on reconnect, survives reload (research R11)
- [X] T073 [US1] Create `features/presence/kiosk/composables/useServerClock.ts` — stores the `(serverTime, performance.now())` anchor and derives `occurredAt` offline (research R3)
- [X] T074 [US1] Create `features/presence/kiosk/services/kioskService.ts` — orchestrates read → derive time → send or enqueue
- [X] T075 [US1] Create `features/presence/kiosk/views/KioskView.vue` — standalone layout with no app chrome, always-focused hidden input for the HID scanner, large name/photo/status feedback, audible cue, manual-entry fallback, and a persistent pending-queue count. **Camera scanning is out of scope this release** (research R2, spec Assumptions)
- [X] T076 [US1] Create `features/presence/kiosk/views/KioskPairingView.vue` — device token entry, stored locally, with a clear unpaired state
- [X] T077 [US1] Register US1 routes in `apps/academic/src/app/providers/router/index.ts`, add the "Presensi" section to `apps/academic/src/config/menuConfig.ts`, and create vitest specs for `useScanQueue` and `kioskService` in `features/presence/kiosk/__tests__/` covering offline enqueue, reload survival, duplicate flush, and clock derivation

**Checkpoint**: US1 is fully functional. The school has a working gate with an auditable
record, and nothing else in this feature is required for it to be useful.

---

## Phase 4: User Story 2 — TU and Kepala Sekolah correct and review employee attendance (Priority: P2)

**Goal**: correct any employee's day with an attributable reason, produce a monthly recap,
and let each person see their own record.

**Independent Test**: with a week of scan data, change one arrival time, mark one person on
official duty, add a record for someone who never scanned, then open the monthly recap and
confirm all three appear corrected, each change naming its actor and reason.
(quickstart.md Scenario 3.)

**Depends on**: US1 (`DailyPresence` rows must exist to correct) and T022 (closed periods).

- [X] T078 [P] [US2] Add `domain/entities/presence-correction.entity.ts` and extend `domain/interfaces/daily-presence-repository.interface.ts` with correction and recap query Inputs
- [X] T079 [US2] Create `infrastructure/persistence/prisma-presence-correction.repository.ts`
- [X] T080 [US2] Create `infrastructure/persistence/prisma-daily-presence.reports.ts` — the monthly recap aggregation, split out to keep the repository class within budget
- [X] T081 [US2] Create `services/presence-audit.service.ts` and its spec — mirrors `portal/post/services/post-audit.service.ts` including its failure policy (a failed audit write is logged at error level, never thrown, because the correction already happened)
- [X] T082 [US2] Create `use-cases/create-daily-presence.use-case.ts` and its spec — manual entry, sets sources to `MANUAL`, requires a reason
- [X] T083 [US2] Create `use-cases/update-daily-presence.use-case.ts` and its spec — **the constrained one**: reason required (400 without), self-edit forbidden (403, FR-015), closed period refused (409 via the `IAttendancePeriodRepository` port from T022), one `PresenceCorrection` per changed field, one `AuditLog` row
- [X] T084 [US2] Create `use-cases/get-daily-presences.use-case.ts` and its spec — day list with the `corrected` flag resolved in one query, not N+1
- [X] T085 [US2] Create `use-cases/get-daily-presence-by-id.use-case.ts` and its spec — includes the full correction trail
- [X] T086 [US2] Create `use-cases/get-my-daily-presences.use-case.ts` and its spec — resolves from the authenticated user with **no `userId` parameter to abuse**; the spec must assert a `read-own` holder cannot reach another person's record (FR-061)
- [X] T087 [US2] Create `use-cases/get-presence-recap.use-case.ts` and its spec — per-employee monthly counts including leave days by type; an employee with no records at all in the month still appears, enumerated from active credentials
- [X] T088 [US2] Create `use-cases/export-presence-recap.use-case.ts` and its spec — reuses the recap use case so the export cannot diverge from the screen (FR-038)
- [X] T089 [US2] Create `dto/request/` and `dto/response/` DTOs for daily records and recap
- [X] T090 [US2] Create `presentation/daily-record.controller.ts` per contracts/presence-api.md, including `GET /presence/daily-records/me` guarded by `presence-records.read-own`
- [X] T091 [US2] Extend `daily-record.module.ts` (created in T053) with the correction repository, the audit service, and US2's use-case providers; export the response DTOs from `index.ts`
- [X] T092 [P] [US2] Create `features/presence/employee-attendance/api/employeeAttendanceApi.ts` and `types/index.ts`
- [X] T093 [US2] Create `features/presence/employee-attendance/services/employeeAttendanceService.ts` and `stores/employeeAttendanceStore.ts`
- [X] T094 [US2] Create `views/EmployeeAttendanceView.vue` with `components/columns.ts` and `components/AttendanceFilterBar.vue` — anomalies (no check-out, check-out without check-in) visually distinct from ordinary rows
- [X] T095 [US2] Create `components/CorrectionDialog.vue` — reason is a required field, not an optional note
- [X] T096 [US2] Create `components/ManualEntryDialog.vue` for someone with no scan at all
- [X] T097 [US2] Create `components/CorrectionTrailPopover.vue` — previous value, actor, timestamp, reason, without a second page load
- [X] T098 [US2] Create `views/MonthlyRecapView.vue` with per-employee counts and an export action
- [X] T099 [US2] Create `features/presence/employee-attendance/views/MyAttendanceView.vue` — the signed-in person's own days and monthly totals, reachable by every staff member holding `presence-records.read-own` (FR-061)
- [X] T100 [US2] Document and verify the non-login employee path in `docs/adr/0007-presence-domain.md` and a spec: recording a satpam or petugas kebersihan provisions a `User` with no usable password and no roles beyond `presence-records.read-own`, since `Teacher.userId` is required and unique (FR-057, FR-058, research R10)
- [X] T101 [US2] Register US2 routes in `apps/academic/src/app/providers/router/index.ts` and menu entries in `apps/academic/src/config/menuConfig.ts`
- [X] T102 [US2] Create vitest spec for `employeeAttendanceService` in `features/presence/employee-attendance/__tests__/`

**Checkpoint**: the school has a trustworthy employee attendance record — the thing that did
not exist at all before this feature (SC-004) — and every staff member can see their own.

---

## Phase 5: User Story 3 — Wali kelas and guru mapel correct student attendance (Priority: P2)

**Goal**: the class view pre-fills from the gate as an unconfirmed suggestion; the teacher's
save remains the only thing that writes, and the report card keeps using the teacher's value.

**Independent Test**: with gate scans for a class, open it as wali kelas and confirm scanned
students are pre-marked and flagged as from-the-gate, unscanned students are flagged as
needing a decision, and a guru mapel can mark a gate-scanned student absent for one lesson
without touching the rest of the day. (quickstart.md Scenario 9.)

**Depends on**: US1. Deliberately does **not** modify any existing attendance write path.

- [X] T103 [P] [US3] *(landed in US1 with the repository)* Implement `IDailyPresenceReadPort.findByUsersAndDate` in `backend/src/presence/daily-record/infrastructure/persistence/prisma-daily-presence.repository.ts` with a spec
- [X] T104 [US3] *(landed in US1 with the module)* Export `IDailyPresenceReadPort` from `backend/src/presence/daily-record/index.ts` and add it to `DailyRecordModule`'s `exports`
- [X] T105 [US3] Create `backend/src/academic/attendance/use-cases/get-attendance-suggestions.use-case.ts` and its spec — resolves enrolments to `userId`s via `IStudentRepository`, calls the port, marks results unconfirmed; **spec must cover the failure policy**: presence unavailable returns an empty suggestion set and logs at warn, never throws
- [X] T106 [US3] Create `backend/src/academic/attendance/dto/response/attendance-suggestion-response.dto.ts`
- [X] T107 [US3] Add the suggestions endpoint to `backend/src/academic/attendance/presentation/attendance.controller.ts` with an explicit return type
- [X] T108 [US3] Import `DailyRecordModule` into `backend/src/academic/attendance/attendance.module.ts` (import the `.module.js` directly, never the barrel — an ESM cycle crashes boot)
- [X] T109 [US3] Add a spec asserting the wali-kelas / guru-mapel authorisation scoping on the existing attendance write use cases (FR-019) — extend `backend/src/academic/attendance/presentation/attendance.controller.spec.ts` rather than duplicating it
- [X] T110 [US3] Add a regression spec beside `backend/src/academic/attendance/use-cases/get-attendance-recap.use-case.spec.ts` asserting the existing student recap and report-card figures are unchanged once suggestions are in play (FR-037, FR-020) — this capability is not rebuilt here, only protected
- [X] T111 [P] [US3] Add the suggestions call to `apps/academic/src/features/academic/attendance/api/attendanceApi.ts`
- [X] T112 [US3] Extend `apps/academic/src/features/academic/attendance/services/attendanceService.ts` and `stores/attendanceStore.ts` to merge suggestions into the class view without persisting them
- [X] T113 [US3] Update `apps/academic/src/features/academic/attendance/components/AttendanceInputTable.vue` — scanned students pre-marked with a visible "dari gerbang, belum dikonfirmasi" badge, unscanned students flagged as needing a decision rather than defaulting to absent (FR-017, FR-018)
- [X] T114 [US3] Show the actual gate arrival time in `apps/academic/src/features/academic/attendance/components/AttendanceInputTable.vue` on rows where it is later than the school start time (FR-021)
- [X] T115 [US3] Verify and, if needed, adjust the per-lesson override path in `apps/academic/src/features/academic/attendance/services/attendanceService.ts` so a guru mapel's single-lesson change does not alter the rest of the day (Acceptance Scenario 3.3)
- [X] T116 [US3] Create a vitest spec covering the merge logic in `apps/academic/src/features/academic/attendance/__tests__/` — including the empty-suggestions degraded path

**Checkpoint**: teachers save time on the common case, and the report card's authority is
unchanged (SC-006, SC-007).

---

## Phase 6: User Story 4 — Working patterns and the calendar decide lateness (Priority: P3)

**Goal**: replace the single school-wide default with per-employee patterns, holidays, and a
closable period, without retroactively changing closed months.

**Independent Test**: define two patterns with different end times, assign them to two
employees, mark a date non-working, and confirm each employee is judged against their own
pattern and that nobody is absent on the holiday. (quickstart.md Scenario 4.)

**Depends on**: US1 (the resolver and status service from T051–T052 already read these
tables) and T022 (the period module this story adds the close action to).

- [X] T117 [P] [US4] ~~Create `backend/src/presence/work-pattern/domain/`~~ — **done early in US1**. `daily-record`'s `DayStatusService` must ask what counts as late from the very first scan, and a repository may only query models its own module owns (Principle VI), so `IWorkPatternRepository` + `PrismaWorkPatternRepository` + `WorkPatternModule` were created during T052. US4 adds the CRUD use cases, DTOs, and controllers on top of the existing module rather than creating it
- [X] T118 [US4] Extend `infrastructure/persistence/prisma-work-pattern.repository.ts` (created in US1 with `resolveForUserAndDate` and `isNonWorkingDay`) with the CRUD reads and writes, splitting out `prisma-work-pattern.where.ts` if it approaches the 200-line budget
- [X] T119 [US4] Create `infrastructure/persistence/prisma-non-working-day.repository.ts`
- [X] T120 [US4] Create `use-cases/create-work-pattern.use-case.ts`, `update-work-pattern.use-case.ts`, `delete-work-pattern.use-case.ts`, `get-work-patterns.use-case.ts` with specs — exactly one `isDefault` pattern is enforceable and enforced
- [X] T121 [US4] Create `use-cases/replace-work-pattern-days.use-case.ts` and its spec — replaces all seven weekdays atomically; a partial update that could drop Friday must be impossible
- [X] T122 [US4] Create `use-cases/assign-work-pattern.use-case.ts` and `use-cases/get-work-pattern-assignments.use-case.ts` with specs — effective-dated, closes any overlapping assignment
- [X] T123 [US4] Create `use-cases/bulk-upsert-non-working-days.use-case.ts` and its spec — takes explicit dates; reads **nothing** from `academic/` (research R9, contracts/internal-ports.md)
- [X] T124 [US4] Create `use-cases/get-non-working-days.use-case.ts`, `update-non-working-day.use-case.ts`, `delete-non-working-day.use-case.ts` with specs
- [X] T125 [US4] Create `backend/src/presence/attendance-period/use-cases/close-attendance-period.use-case.ts` and its spec — refuses with 409 listing records that lack a check-out, since closing is what fixes payroll's inputs
- [X] T126 [US4] Create `backend/src/presence/attendance-period/presentation/attendance-period.controller.ts` and register the close use case in `attendance-period.module.ts`
- [X] T127 [US4] Create `dto/request/` and `dto/response/` DTOs for patterns, assignments, and non-working days
- [X] T128 [US4] Create `presentation/work-pattern.controller.ts` and `presentation/non-working-day.controller.ts` — each within the 150-line budget
- [X] T129 [US4] Create `work-pattern.module.ts` and `index.ts`, and wire into `backend/src/presence/presence.module.ts`
- [X] T130 [US4] Add `backend/src/presence/work-pattern/use-cases/update-work-pattern.use-case.spec.ts` coverage asserting FR-027 — editing a pattern does not change the figures of a `CLOSED` period, because `DailyPresence.workPatternId` records what was judged
- [X] T131 [P] [US4] Create `features/presence/work-pattern/api/`, `types/`, and `services/`
- [X] T132 [US4] Create `views/WorkPatternListView.vue` and `components/WorkPatternFormDialog.vue` with the seven-weekday editor and grace period
- [X] T133 [US4] Create `views/WorkPatternAssignmentView.vue` — assign a pattern to employees with an effective date
- [X] T134 [US4] Create `views/NonWorkingDayListView.vue` and `components/ImportFromCalendarDialog.vue` — reads the existing academic calendar endpoint, **previews the dates**, then posts them to the presence bulk endpoint (research R9)
- [X] T135 [US4] Create `views/AttendancePeriodView.vue` with the close action and the blocking-records list
- [X] T136 [US4] Register US4 routes in `apps/academic/src/app/providers/router/index.ts` and menu entries in `apps/academic/src/config/menuConfig.ts`, and create vitest specs for the pattern service and the calendar-import composition in `apps/academic/src/features/presence/work-pattern/__tests__/`

**Checkpoint**: attendance figures are defensible against Fridays, Ramadan, and holidays.

---

## Phase 7: User Story 5 — Izin, sakit, and cuti with approval (Priority: P3)

**Goal**: legitimate absences stop appearing as violations, with quotas and an approval trail.

**Independent Test**: submit a request over two working days, approve it, and confirm those
days show as approved leave rather than absent in the record and recap; confirm a request
exceeding quota cannot be approved. (quickstart.md Scenario 5.)

**Depends on**: US4 for correct working-day counting; US2 for the recap it must appear in.

- [X] T137 [P] [US5] Create `backend/src/presence/leave/domain/` — entities for `LeaveType`, `LeaveRequest`, `LeaveDay`, `LeaveBalance`, plus repository interfaces
- [X] T138 [US5] Create `infrastructure/persistence/prisma-leave-type.repository.ts`
- [X] T139 [US5] Create `infrastructure/persistence/prisma-leave-request.repository.ts`, `.where.ts`, and `.includes.ts`
- [X] T140 [US5] Create `infrastructure/persistence/prisma-leave-balance.repository.ts` — `used` is derived from approved `LeaveDay` rows, never stored
- [X] T141 [US5] Create `use-cases/` for leave-type CRUD with specs — validates `annualQuota` present when `consumesQuota` is true
- [X] T142 [US5] Create `services/working-day-expander.service.ts` and its spec — expands a date range into working days against the pattern and non-working days in force **at submission time**, so a later calendar change cannot alter an approved request (FR-027)
- [X] T143 [US5] Create `use-cases/submit-leave-request.use-case.ts` and its spec — materialises `LeaveDay` rows and `workingDayCount`; 422 when `requiresDocument` and no `documentFileId`
- [X] T144 [US5] Create `use-cases/approve-leave-request.use-case.ts` and its spec — 403 when approver is the requester (FR-029), 422 with the shortfall when quota is short (FR-032), 409 when not `PENDING`; writes covered days into `DailyPresence` with the type's treatment, in one same-module transaction
- [X] T145 [US5] Create `use-cases/reject-leave-request.use-case.ts` and its spec — reason required
- [X] T146 [US5] Create `use-cases/withdraw-leave-request.use-case.ts` and its spec — requester only, `PENDING` only, consumes no quota
- [X] T147 [US5] Create `use-cases/get-leave-requests.use-case.ts` and `get-my-leave-requests.use-case.ts` with specs
- [X] T148 [US5] Create `use-cases/get-leave-balances.use-case.ts` and its spec — quota minus derived usage
- [X] T149 [US5] Create `use-cases/record-student-excused-absence.use-case.ts` and its spec — the wali kelas path for a sick note (FR-035)
- [X] T150 [US5] Extend the scan path so a scan on an approved-leave date is recorded and surfaced as a conflict rather than discarded (FR-034), with a spec in `backend/src/presence/scan/use-cases/record-scan.use-case.spec.ts`
- [X] T151 [US5] Create `dto/request/` and `dto/response/` DTOs for leave types, requests, and balances
- [X] T152 [US5] Create `presentation/leave-type.controller.ts` and `presentation/leave-request.controller.ts`
- [X] T153 [US5] Create `leave.module.ts` and `index.ts`, and wire into `backend/src/presence/presence.module.ts`
- [X] T154 [P] [US5] ~~Create `features/presence/leave-type/config.ts` driving `@241/master-data`~~ — **built bespoke instead, following the `position` precedent**. `MasterDataField` is `text | boolean` only; leave types need two enums and a number. `academic/position` already handles exactly this case with its own `PositionFormDialog` + store + view rather than a master-data config, so ADR-0001's rule reads as "simple lookups go through the engine" — an entity needing a select builds its own dialog. Delivered as `features/presence/leave-type/` in that shape
- [X] T155 [P] [US5] Create `features/presence/leave/api/`, `types/`, and `services/`
- [X] T156 [US5] Create `views/LeaveRequestListView.vue` and `components/SubmitLeaveDialog.vue` with document upload through the existing file feature
- [X] T157 [US5] Create `views/LeaveApprovalView.vue` with approve and reject actions, showing the quota impact before the decision
- [X] T158 [US5] Create `views/MyLeaveView.vue` and `components/LeaveBalanceCards.vue`
- [X] T159 [US5] Surface the leave-vs-scan conflict in `apps/academic/src/features/presence/employee-attendance/views/EmployeeAttendanceView.vue` and its `components/columns.ts` (FR-034)
- [X] T160 [US5] Register US5 routes in `apps/academic/src/app/providers/router/index.ts` and menu entries in `apps/academic/src/config/menuConfig.ts`
- [X] T161 [US5] Create a vitest spec for the leave service, including the quota shortfall path, in `apps/academic/src/features/presence/leave/__tests__/`

**Checkpoint**: no legitimate absence reads as a violation (SC-014). Attendance is now
trustworthy enough for money to depend on it.

---

## Phase 8: User Story 6 — Monthly payroll from attendance (Priority: P4)

**Goal**: compute each employee's complete take-home amount from their salary components and
their attendance, with an approval gate and an immutable result.

**Independent Test**: with one closed month for two employees, define a base salary, an
allowance, and an attendance-driven deduction, run payroll, and confirm each net follows from
that employee's own attendance and that components sum exactly to net. Approve and confirm
immutability and per-employee payslip isolation. (quickstart.md Scenarios 6 and 7.)

**Depends on**: US2, US4, US5 — payroll refuses to run against an open period, and the
figures are only defensible once corrections, patterns, and leave are all in place.

### Component and assignment modules

- [X] T162 [P] [US6] Create `backend/src/payroll/component/domain/` — entity and `ISalaryComponentRepository`
- [X] T163 [US6] Create `infrastructure/persistence/prisma-salary-component.repository.ts`
- [X] T164 [US6] Create create/update/delete/get use cases with specs in `backend/src/payroll/component/use-cases/` — 422 when `driver` is present on a non-driven type or absent on a driven one
- [X] T165 [US6] Create component DTOs, `presentation/salary-component.controller.ts`, `component.module.ts`, and `index.ts`
- [X] T166 [P] [US6] Create `backend/src/payroll/assignment/domain/` — entity and `ISalaryAssignmentRepository`
- [X] T167 [US6] Create `infrastructure/persistence/prisma-salary-assignment.repository.ts` and `.where.ts` — resolve "in force on a date"
- [X] T168 [US6] Create `use-cases/create-salary-assignment.use-case.ts` and its spec — closes any open assignment with `effectiveTo` and inserts a new row in one transaction; **never updates an amount in place**, so an earlier month can be reproduced
- [X] T169 [US6] Create `use-cases/get-salary-assignments.use-case.ts`, `get-user-salary-assignments.use-case.ts`, `delete-salary-assignment.use-case.ts` with specs
- [X] T170 [US6] Create assignment DTOs and `presentation/salary-assignment.controller.ts` — guarded by `payroll-salaries.*`, **deliberately not** `payroll-runs.*` (FR-043)
- [X] T171 [US6] Create `assignment.module.ts` and `index.ts`

### Run module

- [X] T172 [P] [US6] Create `backend/src/payroll/run/domain/` — entities for `PayrollRun`, `Payslip`, `PayslipLine`, and their repository interfaces
- [X] T173 [US6] Create `infrastructure/persistence/prisma-payroll-run.repository.ts`, `.where.ts`, and `.writer.ts` — the writer keeps the run + payslips + lines transaction out of the repository class's line budget
- [X] T174 [US6] Create `services/salary-resolver.service.ts` and its spec — which assignment was in force on the period's last day, per employee
- [X] T175 [US6] Create `services/attendance-driver.service.ts` and its spec — maps each `AttendanceDriver` to a count from the presence monthly summary, read through `IDailyPresenceReadPort` (never `this.prisma.dailyPresence`)
- [X] T176 [US6] Create `services/rounding.service.ts` and its spec — half-up to whole rupiah **per line**, then sum; the spec must assert lines reconcile exactly to net across fractional cases (FR-046, SC-015)
- [X] T177 [US6] Create `use-cases/create-payroll-run.use-case.ts` and its spec — a thin orchestrator over the three services; 409 when the period is not `CLOSED` (via the T022 port), 409 when an `ORIGINAL` run exists, 422 listing employees with no salary assignment; all writes in one same-module interactive transaction. **Keep under 300 lines** (constitution V)
- [X] T178 [US6] Create `use-cases/recalculate-payroll-run.use-case.ts` and its spec — `DRAFT` only, returns the previous-draft comparison (FR-044)
- [X] T179 [US6] Create `use-cases/submit-payroll-run.use-case.ts` and `use-cases/approve-payroll-run.use-case.ts` with specs — enforce the `DRAFT → SUBMITTED → APPROVED` machine; `APPROVED` is terminal
- [X] T180 [US6] Create `use-cases/get-payroll-runs.use-case.ts` and `get-payroll-run-by-id.use-case.ts` with specs
- [X] T181 [US6] Add `backend/src/payroll/run/use-cases/approve-payroll-run.use-case.spec.ts` coverage asserting every mutating path on an `APPROVED` run returns 409 directing to an adjustment run (FR-049, FR-050)
- [X] T182 [US6] Create run DTOs and `presentation/payroll-run.controller.ts`
- [X] T183 [US6] Create `run.module.ts` and `index.ts`

### Payslip module

- [X] T184 [P] [US6] Create `backend/src/payroll/payslip/domain/` and `infrastructure/persistence/prisma-payslip.repository.ts`
- [X] T185 [US6] Create `use-cases/get-my-payslip.use-case.ts` and its spec — resolves from the authenticated user; there is no `userId` parameter to abuse
- [X] T186 [US6] Create `use-cases/get-payslip-by-id.use-case.ts` and its spec — `payroll-payslips.read`; a `read-own` holder reaching for another's gets 403
- [X] T187 [US6] Create `services/payroll-audit.service.ts` and its spec — writes an `AuditLog` row for every payroll access and refusal (FR-052) via `CreateAuditLogUseCase`, following `PostAuditService`'s failure policy. **No new audit table** (data-model.md)
- [X] T188 [US6] Create payslip DTOs in `backend/src/payroll/payslip/dto/response/` — money is serialised as whole-rupiah **strings**, never JSON numbers
- [X] T189 [US6] Create `presentation/payslip.controller.ts`, `payslip.module.ts`, and `index.ts`
- [X] T190 [US6] Wire all four modules into `backend/src/payroll/payroll.module.ts`

### Frontend

- [X] T191 [P] [US6] Create `features/payroll/component/config.ts` driving `@241/master-data`, plus `api/` and `types/`
- [X] T192 [P] [US6] Create `features/payroll/assignment/api/`, `types/`, and `services/`
- [X] T193 [US6] Create `features/payroll/assignment/views/SalaryAssignmentView.vue` — per-employee components with effective dates and the superseded history visible
- [X] T194 [P] [US6] Create `features/payroll/run/api/`, `types/`, and `services/`
- [X] T195 [US6] Create `features/payroll/run/views/PayrollRunListView.vue` and `views/PayrollRunDetailView.vue` with totals and the per-employee breakdown
- [X] T196 [US6] Create `features/payroll/run/components/RecalculateComparison.vue` — shows changed payslips against the previous draft (FR-044)
- [X] T197 [US6] Create `features/payroll/run/components/RunWorkflowActions.vue` — submit and approve, with the approved state visibly terminal rather than a disabled button with no explanation
- [X] T198 [US6] Create `features/payroll/payslip/views/MyPayslipView.vue` and `views/PayslipDetailView.vue` — every attendance-driven line shows its count and rate (FR-045); amounts formatted with `Intl.NumberFormat('id-ID')`
- [X] T199 [US6] Register US6 routes in `apps/academic/src/app/providers/router/index.ts` and the Penggajian section in `apps/academic/src/config/menuConfig.ts` — hidden for accounts holding no `payroll-*` permission
- [X] T200 [US6] Create vitest specs for the rounding helper and the run service in `apps/academic/src/features/payroll/run/__tests__/`, mirroring the backend reconciliation assertion

**Checkpoint**: all six stories functional. The full cycle from card to payslip works.

---

## Phase 9: Polish & Cross-Cutting Concerns

- [X] T201 [P] Create `backend/test/payroll-authorization.e2e-spec.ts` — enumerate every route in contracts/payroll-api.md and assert 403 for an `ADMIN`-role account with no explicit payroll grant. **This is the ADR-0008 regression net**; without it a later edit to `ROLE_BYPASS_EXEMPT_PREFIXES` silently reopens every salary. Model on `test/portal-public-visibility.e2e-spec.ts`
- [X] T202 [P] Create `backend/src/presence/presence-roster-independence.spec.ts` — assert no file under `src/presence/` or `src/payroll/` references a position name, position category, or employment-type code (FR-056, SC-016). Model on `src/portal/portal-siakad-disjointness.spec.ts`
- [X] T203 [P] Create `backend/src/presence/presence-academic-direction.spec.ts` — assert no file under `src/presence/` imports from `src/academic/`, keeping the domain graph one-way (research R1)
- [X] T204 [P] Create `backend/test/presence-self-service.e2e-spec.ts` — assert `GET /presence/daily-records/me` and `GET /payroll/payslips/me` return only the caller's own data, and that a `read-own` holder gets 403 on the corresponding list and by-id routes (FR-061, FR-051)
- [X] T205 Update `CLAUDE.md` — add `presence/` and `payroll/` to the backend domain list and to the domains-holding-sibling-modules sentence; note that `academic/attendance` is per-lesson while `presence/` is gate presence, and that credential validity defines a person's expected days
- [X] T206 Audit every new file against the constitution's line budgets — use case ≤ 300, repository ≤ 200, controller ≤ 150, any other file ≤ 300 (excluding imports and Swagger decorators); split with `*.includes.ts` / `*.where.ts` / `*.writer.ts` where over
- [X] T207 Audit comment discipline across new files — one line the norm, two the maximum, explaining WHY; remove any comment restating the code
- [X] T208 [P] Verify `backend/src/` remains free of `any` outside specs
- [ ] T209 **Needs a running deployment — the harness is written and syntax-checked:** `specs/002-qr-attendance-payroll/load-check.mjs`, documented in quickstart.md. Load-check SC-002: confirm one device sustains ≥ 20 accepted scans/minute and SC-001's 2-second confirmation under that load; at the upper roll (~660 people) confirm two devices clear the rush in under 17 minutes
- [ ] T210 **Partly discharged automatically:** the queue-depth and chunking half is now asserted in `apps/academic/src/features/presence/kiosk/__tests__/kioskService.spec.ts` (900-deep queue drains in 500-sized chunks; a drop between chunks keeps what landed). What remains needs a browser: that the queue survives a tab reload. Verify SC-013 by running quickstart Scenario 2 with a full 4-hour simulated outage and a realistic queue depth
- [ ] T211 Run the complete quickstart.md — all nine scenarios, including Scenario 8's new-position check
- [X] T212 Run `pnpm --filter backend validate` and `pnpm --filter academic-web validate` (filter by package name, never by path)
- [X] T213 Re-survey the Compliance Baseline in `.specify/memory/constitution.md` now that the code exists, per the amendment procedure — the final survey, replacing T004's provisional entry
- [ ] T214 Run `pnpm typecheck` and `pnpm test` from the repo root, then open the PR — confirm ADR-0007, ADR-0008, the constitution bump, and the `CLAUDE.md` update are all in the same change, as documentation parity requires

---

## Dependencies & Execution Order

### Phase dependencies

- **Phase 1 (Setup)**: no dependencies. T004 depends on T002 and T003
- **Phase 2 (Foundational)**: depends on Phase 1 — **blocks every user story**
- **Phase 3 (US1)**: depends on Phase 2 only
- **Phase 4 (US2)**: depends on US1 (records to correct) and T022 (closed-period refusal)
- **Phase 5 (US3)**: depends on US1 — suggestions need gate data
- **Phase 6 (US4)**: depends on US1 (refines T051–T052) and T022 (adds the close action)
- **Phase 7 (US5)**: depends on US4 (working-day counting) and US2 (the recap leave appears in)
- **Phase 8 (US6)**: depends on US2, US4, US5, and T022 — refuses to run against an open period
- **Phase 9 (Polish)**: depends on all shipped stories

### Why `attendance-period` and `daily-record` sit where they do

Both were moved by the `/speckit-analyze` pass, and both for the same reason: a module has to
exist before its first consumer, and story phases cut across module boundaries.

- **`daily-record.module.ts` is created in US1 (T053)**, not US2, because US1's
  `RecordScanUseCase` injects the daily-presence repository. US2 extends the module (T091)
  rather than creating it.
- **`attendance-period` is Foundational (T022)**, not US4, because US2 refuses edits inside a
  closed period, US4 closes one, and US6 refuses to run against an open one. No single story
  owns it.

### An honest note on independence

The template's ideal is that every story is independently deliverable. Four of these six are;
two are not, and pretending otherwise would produce a plan that fails on contact:

- **US2 and US3 genuinely require US1.** There is nothing to correct or to pre-fill before
  gate records exist. Both are independently *testable* once US1 ships, which is the property
  that actually matters.
- **US6 requires US2, US4, and US5** — not technically, but substantively. Running payroll on
  attendance that cannot be corrected, has no working-pattern awareness, and treats approved
  leave as absence would produce wrong pay, which is worse than no payroll at all.

**US4 and US5 are mutually independent** and can proceed in parallel after US1 and US2.

### Within each story

Domain interfaces → repository → services → use cases (each with its spec) → DTOs →
controller → module wiring → frontend api → service/store → views → routes and menu.

### Parallel opportunities

- T002, T003, T005 in Setup
- T014, T015, T017, T026, T027 in Foundational
- Every task marked `[P]` opens a module's `domain/` — those are new files with no shared edges
- **Never parallel**: `permission-codes.constants.ts` (T009, T010), the router index and
  `menuConfig.ts` (T077, T101, T136, T160, T199), `presence.module.ts` wiring (T023, T064,
  T129, T153), and `daily-record.module.ts` (T053, T091). Every one is a shared file that
  will conflict

---

## Parallel Example: User Story 1

```bash
# Domain layers across four modules — all new files, no shared edges:
Task: "T029 Create credential domain entity and repository interface"
Task: "T041 Create device domain entity and repository interface"
Task: "T049 Create daily-presence entity, repository interface, and read port"
Task: "T054 Create scan entity and repository interface"

# Frontend api + types across three features:
Task: "T065 Create credential api and types"
Task: "T069 Create device api, types, and service"
Task: "T071 Create kiosk api and types"
```

---

## Implementation Strategy

### MVP: Phases 1–3 (T001–T077)

Setup, Foundational, and User Story 1. Delivers a working gate: cards issued, a registered
device, scans recorded with duplicate suppression and offline survival, and an auditable
record for students and employees alike. **Stop here and validate** with quickstart Scenarios
1 and 2 before going further.

### Recommended increments

1. **T001–T077** → MVP. Run one gate for a week on real traffic. This is where the assumptions
   about morning queue behaviour, card durability, and scanner placement get tested by
   reality rather than by a spec.
2. **T078–T116** (US2 + US3) → the record becomes trustworthy, every staff member can see
   their own attendance, and teachers start saving time. This is the first point at which the
   school gets something it did not have before at all: a complete employee attendance record.
3. **T117–T161** (US4 + US5) → figures become defensible against Fridays, holidays, and
   legitimate absence. **Run one full month here before touching payroll.**
4. **T162–T200** (US6) → payroll. Consider running it in parallel with the existing manual
   process for one month and reconciling the two before anyone is paid from it.
5. **T201–T214** → polish, security nets, and the gates.

### Parallel team strategy

After Phase 2, US1 is on the critical path and cannot be parallelised away — everything else
waits on it. Once US1 ships, US2/US3 and US4 can proceed on separate tracks, and US5 joins
after US4. US6 is a single track and should be one pair's work throughout, because its
correctness argument spans all four of its modules.

---

## Notes

- `[P]` = different files, no dependency on an incomplete task
- Every backend use-case task delivers the use case **and its `*.spec.ts`** — constitution
  Principle V, not a stylistic preference
- Import a NestJS Module class or a cross-module DTO from its own `.module.js` / DTO file,
  never through a barrel: a DTO importing a barrel closes an ESM cycle and crashes boot
- Every query filters `deletedAt: null`; every period-bound read is scoped
- Commit per task or per logical group; hooks must not be bypassed with `--no-verify`
- Stop at any checkpoint to validate a story on its own
