# Phase 1 Data Model: QR Card Attendance, Leave & Payroll

**Feature**: `002-qr-attendance-payroll` | **Date**: 2026-08-10

Two new Prisma schema files. Conventions follow the existing schema exactly: `uuid` primary
keys with `@db.Uuid`, `snake_case` via `@map`, `@@map` to a plural table name, `deletedAt`
for soft delete on anything a user can remove, `Decimal @db.Decimal(15, 2)` for money
(matching `inventory.prisma`).

**Ownership**: `presence/` owns every table in `presence.prisma`; `payroll/` owns every
table in `payroll.prisma`. Neither reads the other's tables directly — see
[contracts/internal-ports.md](./contracts/internal-ports.md). Nothing here has a foreign key
into `academic/`; the only outward reference is `userId → User`, which is `platform/`.

---

## `backend/prisma/presence.prisma`

### Enums

```prisma
enum PresenceSubjectType { STUDENT  EMPLOYEE }

enum CredentialStatus    { ACTIVE  REVOKED  REPLACED }

enum ScanOutcome {
  ACCEPTED
  DUPLICATE            // repeat within the suppression window (R4)
  REJECTED_UNKNOWN     // code resolves to nothing
  REJECTED_REVOKED     // credential revoked or replaced
  REJECTED_INACTIVE    // person no longer active
  REJECTED_STALE       // derived occurredAt outside the accepted offline window (R3)
}

enum PresenceDayStatus {
  PRESENT
  LATE
  ABSENT
  ON_LEAVE
  OFFICIAL_DUTY
  NOT_EXPECTED         // holiday, non-working weekday, or outside employment/enrolment
}

enum PresenceValueSource { SCAN  MANUAL }

enum LeaveTreatment      { ON_LEAVE  OFFICIAL_DUTY }

enum LeaveRequestStatus  { PENDING  APPROVED  REJECTED  WITHDRAWN }

enum AttendancePeriodStatus { OPEN  CLOSED }
```

> `PresenceDayStatus` deliberately does **not** reuse the existing `AttendanceStatus`
> (`PRESENT/ABSENT/LATE/EXCUSED/SICK` in `assessment.prisma:9`). That enum answers "was this
> pupil in this lesson"; this one answers "was this person at school today, and were they
> expected to be". `NOT_EXPECTED` and `OFFICIAL_DUTY` have no counterpart there, and
> `SICK` is a leave type here rather than a day status. Sharing them would force one enum to
> serve two questions.

### `PresenceCredential`

The card. One active credential per person at a time; history survives replacement.

| Field | Type | Notes |
|---|---|---|
| `id` | `String @id @default(uuid())` | |
| `userId` | `String @db.Uuid` | → `User`. Not `Student`/`Teacher` — see research R1 |
| `subjectType` | `PresenceSubjectType` | denormalised at issue; lets presence recap without asking academic |
| `code` | `String @unique @db.VarChar(64)` | opaque ≥128-bit random token (R12) |
| `status` | `CredentialStatus @default(ACTIVE)` | |
| `issuedAt` | `DateTime @default(now())` | |
| `issuedBy` | `String? @db.Uuid` | → `User` |
| `revokedAt` | `DateTime?` | |
| `revokedReason` | `String? @db.VarChar(255)` | |
| `replacedById` | `String? @db.Uuid` | self-relation → the credential that superseded this one |
| `deletedAt` | `DateTime?` | |

- `@@unique([userId], where: { status: ACTIVE, deletedAt: null })` — one active card per person
- `@@index([userId])`, `@@index([status])`
- `@@map("presence_credentials")`

**Rules**: revoking sets `status = REVOKED` and stamps `revokedAt`; a code is never reused or
freed. Replacement issues a new row and points the old one at it via `replacedById`, so
FR-002's continuity holds — history is joined through `userId`, not through the card.

**This table is also the answer to "was this person expected today?"** (FR-011). A person is
expected on a date when they held a credential covering it — that is, some credential for
that `userId` with `issuedAt <= date` and either no `revokedAt` or `revokedAt >= date`,
counting a replacement chain as continuous. Outside that window the day is `NOT_EXPECTED`,
never `ABSENT`.

The alternative would be for presence to read `TeacherPosition.hireDate` or a student's
enrolment dates, and it must not: that is a read into `academic/`, which would close the
domain cycle research R1 exists to prevent. Card validity is also closer to the truth being
asserted — a new hire who has not been issued a card yet cannot scan, so counting them absent
would be recording a failure of card issuance as a failure of attendance. The operational
consequence is stated plainly so nobody is surprised by it: **issuing the card is what starts
someone's attendance history**, and revoking it on their last day is what ends it.

### `PresenceDevice`

A registered gate terminal.

| Field | Type | Notes |
|---|---|---|
| `id` | `String @id @default(uuid())` | |
| `name` | `String @db.VarChar(100)` | "Gerbang Utama" |
| `location` | `String? @db.VarChar(150)` | |
| `tokenHash` | `String @db.VarChar(255)` | hash only — the token is shown once (R7) |
| `tokenIssuedAt` | `DateTime` | |
| `isActive` | `Boolean @default(true)` | |
| `lastSeenAt` | `DateTime?` | updated on every accepted contact; how an outage becomes visible |
| `deletedAt` | `DateTime?` | |

- `@@map("presence_devices")`

### `PresenceScan`

Every presentation of a code, accepted or not (FR-003).

| Field | Type | Notes |
|---|---|---|
| `id` | `String @id @default(uuid())` | |
| `deviceId` | `String @db.Uuid` | → `PresenceDevice` |
| `credentialId` | `String? @db.Uuid` | null when the code resolved to nothing |
| `presentedCode` | `String @db.VarChar(64)` | what was actually scanned, retained even when unknown |
| `clientEventId` | `String @db.Uuid` | device-generated; the retry key (R4) |
| `occurredAt` | `DateTime` | server time, or server-anchored monotonic derivation (R3) |
| `receivedAt` | `DateTime @default(now())` | kept separate so clock drift is detectable |
| `outcome` | `ScanOutcome` | |
| `rejectionReason` | `String? @db.VarChar(255)` | |

- `@@unique([deviceId, clientEventId])` — **the idempotency guarantee for offline flush**
- `@@index([credentialId, occurredAt])`, `@@index([occurredAt])`, `@@index([outcome])`
- `@@map("presence_scans")`

No `deletedAt`: this is an append-only evidence log. Nothing edits or removes a scan.

### `DailyPresence`

One row per person per date. The unit recaps and payroll read.

| Field | Type | Notes |
|---|---|---|
| `id` | `String @id @default(uuid())` | |
| `userId` | `String @db.Uuid` | |
| `subjectType` | `PresenceSubjectType` | |
| `date` | `DateTime @db.Date` | |
| `checkInAt` | `DateTime?` | |
| `checkOutAt` | `DateTime?` | |
| `checkInSource` | `PresenceValueSource?` | FR-014 — scanned or entered by hand |
| `checkOutSource` | `PresenceValueSource?` | |
| `status` | `PresenceDayStatus` | derived, then overridable by correction |
| `statusSource` | `PresenceValueSource @default(SCAN)` | |
| `lateMinutes` | `Int @default(0)` | beyond the grace period, never negative |
| `earlyLeaveMinutes` | `Int @default(0)` | |
| `workPatternId` | `String? @db.Uuid` | the pattern actually judged against — FR-024, FR-027 |
| `leaveRequestId` | `String? @db.Uuid` | set when the day is covered by approved leave |
| `note` | `String? @db.Text` | |
| `deletedAt` | `DateTime?` | |

- `@@unique([userId, date], where: { deletedAt: null })`
- `@@index([date, subjectType])` — drives the daily list and the class pre-fill
- `@@index([userId, date])` — drives the monthly recap and payroll
- `@@map("daily_presences")`

**Why `workPatternId` is stored rather than looked up**: FR-027 forbids recomputing a closed
period when a pattern changes later. Recording which pattern produced the numbers is what
makes that possible without freezing the patterns themselves.

**`NOT_EXPECTED` has three causes**, and the day-status service must check all three: the
date is a `NonWorkingDay`; the resolved `WorkPatternDay` has `isWorkingDay = false`; or the
person held no valid credential on that date (see `PresenceCredential` above). Only after all
three are excluded may a day with no check-in become `ABSENT`.

**Anomaly representation**: check-out without check-in leaves `checkInAt` null with
`checkOutAt` set — surfaced by the daily list as needing correction, never silently promoted
to an arrival (spec edge case).

### `PresenceCorrection`

The trail behind every manual change (FR-013, FR-052, FR-060).

| Field | Type | Notes |
|---|---|---|
| `id` | `String @id @default(uuid())` | |
| `dailyPresenceId` | `String @db.Uuid` | |
| `field` | `String @db.VarChar(40)` | `checkInAt`, `checkOutAt`, `status`, `note` |
| `previousValue` | `String? @db.VarChar(255)` | serialised; null when the row was created by hand |
| `newValue` | `String? @db.VarChar(255)` | |
| `reason` | `String @db.VarChar(255)` | **required** — FR-013 |
| `actorId` | `String @db.Uuid` | → `User` |
| `createdAt` | `DateTime @default(now())` | |

- `@@index([dailyPresenceId])`
- `@@map("presence_corrections")`

Append-only. This is the module-local trail; `AuditLog` additionally receives a row for the
same event, following `PostAuditService`'s pattern and failure policy (a failed audit write
is logged, never thrown — the correction already happened).

### `WorkPattern` / `WorkPatternDay` / `WorkPatternAssignment`

| `WorkPattern` | Type | Notes |
|---|---|---|
| `id`, `deletedAt` | | |
| `name` | `String @db.VarChar(100)` | "Standar", "Ramadan", "Piket" |
| `isDefault` | `Boolean @default(false)` | the school-wide fallback — FR-024 |
| `graceMinutes` | `Int @default(0)` | FR-025 |

- `@@unique([isDefault], where: { isDefault: true, deletedAt: null })` — exactly one default
- `@@map("work_patterns")`

| `WorkPatternDay` | Type | Notes |
|---|---|---|
| `workPatternId` | `String @db.Uuid` | |
| `weekday` | `Int` | 0 = Sunday … 6 = Saturday |
| `isWorkingDay` | `Boolean @default(true)` | |
| `startTime` | `String @db.VarChar(5)` | `"07:00"` — a wall-clock time, not an instant |
| `endTime` | `String @db.VarChar(5)` | `"14:00"` |

- `@@unique([workPatternId, weekday])`
- `@@map("work_pattern_days")`

> Times are stored as `"HH:mm"` strings rather than `DateTime`. A pattern's start is a
> recurring wall-clock time with no date; a `DateTime` column would force an arbitrary date
> and invite a timezone conversion that silently shifts every school day by hours.

| `WorkPatternAssignment` | Type | Notes |
|---|---|---|
| `userId`, `workPatternId` | `String @db.Uuid` | |
| `effectiveFrom` | `DateTime @db.Date` | |
| `effectiveTo` | `DateTime? @db.Date` | null = still in force |
| `deletedAt` | `DateTime?` | |

- `@@index([userId, effectiveFrom])`
- `@@map("work_pattern_assignments")`

Resolution order for a given user and date: the assignment in force on that date → otherwise
the `isDefault` pattern. `DailyPresence.workPatternId` records which one won.

### `NonWorkingDay`

Owned by `presence/`, imported on demand from `AcademicCalendar` (research R9).

| Field | Type | Notes |
|---|---|---|
| `date` | `DateTime @db.Date` | |
| `name` | `String @db.VarChar(150)` | |
| `sourceCalendarId` | `String? @db.Uuid` | provenance only — **not** a foreign key across the domain boundary |
| `deletedAt` | `DateTime?` | |

- `@@unique([date], where: { deletedAt: null })`
- `@@map("non_working_days")`

### `LeaveType`

Reference data, driven by a `@241/master-data` `config.ts` on the frontend (ADR-0001).

| Field | Type | Notes |
|---|---|---|
| `code` | `String @unique @db.VarChar(30)` | `IZIN`, `SAKIT`, `CUTI_TAHUNAN`, `DINAS_LUAR` |
| `name` | `String @db.VarChar(100)` | |
| `treatment` | `LeaveTreatment` | how the covered day is counted |
| `consumesQuota` | `Boolean @default(false)` | |
| `annualQuota` | `Int?` | default quota when it consumes one — FR-032 |
| `requiresDocument` | `Boolean @default(false)` | |
| `appliesTo` | `PresenceSubjectType` | student sick notes vs employee leave |
| `isActive` | `Boolean @default(true)` | |
| `deletedAt` | `DateTime?` | |

- `@@map("leave_types")`

### `LeaveRequest` / `LeaveDay` / `LeaveBalance`

| `LeaveRequest` | Type | Notes |
|---|---|---|
| `requesterId` | `String @db.Uuid` | → `User` |
| `leaveTypeId` | `String @db.Uuid` | |
| `startDate`, `endDate` | `DateTime @db.Date` | |
| `reason` | `String @db.Text` | |
| `documentFileId` | `String? @db.Uuid` | → `File` (`platform/file`) |
| `status` | `LeaveRequestStatus @default(PENDING)` | |
| `approverId` | `String? @db.Uuid` | |
| `decidedAt` | `DateTime?` | |
| `decisionReason` | `String? @db.VarChar(255)` | required on rejection — FR-031 |
| `workingDayCount` | `Int` | materialised at submission; only working days — FR-032 |
| `deletedAt` | `DateTime?` | |

- `@@index([requesterId, status])`, `@@index([status])`
- `@@map("leave_requests")`

| `LeaveDay` | Type | Notes |
|---|---|---|
| `leaveRequestId` | `String @db.Uuid` | |
| `date` | `DateTime @db.Date` | one row per **working** day covered |

- `@@unique([leaveRequestId, date])`, `@@index([date])`
- `@@map("leave_days")`

> Materialising the covered days rather than range-scanning on every read is what makes
> "is this person on leave today" a single indexed lookup, and it is computed once against
> the working pattern and holidays in force at approval time — so a later calendar change
> cannot retroactively alter an approved request (FR-027).

| `LeaveBalance` | Type | Notes |
|---|---|---|
| `userId`, `leaveTypeId` | `String @db.Uuid` | |
| `year` | `Int` | |
| `quota` | `Int` | seeded from `LeaveType.annualQuota`, overridable per person |

- `@@unique([userId, leaveTypeId, year])`
- `@@map("leave_balances")`

`used` is **not** stored — it is `count(LeaveDay)` over approved requests for that user,
type, and year. One source of truth; a withdrawn or rejected request cannot leave a stale
counter behind.

### `AttendancePeriod`

FR-039 — closing a month fixes its recap.

| Field | Type | Notes |
|---|---|---|
| `year`, `month` | `Int` | |
| `status` | `AttendancePeriodStatus @default(OPEN)` | |
| `closedAt` | `DateTime?` | |
| `closedBy` | `String? @db.Uuid` | |

- `@@unique([year, month])`
- `@@map("attendance_periods")`

---

## `backend/prisma/payroll.prisma`

### Enums

```prisma
enum SalaryComponentType { BASE  ALLOWANCE  ATTENDANCE_DRIVEN  DEDUCTION }

enum AttendanceDriver {
  PRESENT_DAYS
  ABSENT_DAYS
  LATE_COUNT
  LATE_MINUTES
  EARLY_LEAVE_COUNT
  LEAVE_DAYS
  OFFICIAL_DUTY_DAYS
}

enum PayrollRunStatus { DRAFT  SUBMITTED  APPROVED }
enum PayrollRunKind   { ORIGINAL  ADJUSTMENT }
```

### `SalaryComponent`

| Field | Type | Notes |
|---|---|---|
| `code` | `String @unique @db.VarChar(30)` | |
| `name` | `String @db.VarChar(100)` | "Gaji Pokok", "Tunjangan Jabatan", "Potongan Alpa" |
| `type` | `SalaryComponentType` | |
| `driver` | `AttendanceDriver?` | required iff `type = ATTENDANCE_DRIVEN` |
| `isActive` | `Boolean @default(true)` | |
| `deletedAt` | `DateTime?` | |

- `@@map("salary_components")`

### `SalaryAssignment`

Effective-dated. FR-042: a run for March uses what was in force in March.

| Field | Type | Notes |
|---|---|---|
| `userId`, `componentId` | `String @db.Uuid` | |
| `amount` | `Decimal? @db.Decimal(15, 2)` | for `BASE`, `ALLOWANCE`, fixed `DEDUCTION` |
| `rate` | `Decimal? @db.Decimal(15, 2)` | per unit of the driver, for `ATTENDANCE_DRIVEN` |
| `effectiveFrom` | `DateTime @db.Date` | |
| `effectiveTo` | `DateTime? @db.Date` | |
| `createdBy` | `String @db.Uuid` | |
| `deletedAt` | `DateTime?` | |

- `@@index([userId, effectiveFrom])`
- `@@map("salary_assignments")`

Superseding an assignment closes the old row with `effectiveTo` and inserts a new one; it
never updates the amount in place. That is what lets a rerun of an earlier month reproduce
its original figures, and what Acceptance Scenario 6.3 tests.

**Mid-month change**: the run applies the assignment in force on the **last day of the
period** and records it on the payslip line. Proration is out of scope; the payslip states
which amount was applied, per the spec's edge case, rather than silently blending two.

### `PayrollRun`

| Field | Type | Notes |
|---|---|---|
| `year`, `month` | `Int` | |
| `kind` | `PayrollRunKind @default(ORIGINAL)` | |
| `sequence` | `Int @default(1)` | 1 for the original, incrementing for adjustments |
| `status` | `PayrollRunStatus @default(DRAFT)` | |
| `roundingRule` | `String @db.VarChar(20) @default("HALF_UP_RUPIAH")` | recorded, not assumed (R5) |
| `createdBy` | `String @db.Uuid` | |
| `submittedBy`, `submittedAt` | `String? / DateTime?` | |
| `approvedBy`, `approvedAt` | `String? / DateTime?` | |
| `note` | `String? @db.Text` | |
| `deletedAt` | `DateTime?` | |

- `@@unique([year, month, kind, sequence], where: { deletedAt: null })`
- `@@map("payroll_runs")`

**State machine** — the only legal transitions:

```
DRAFT ──submit──▶ SUBMITTED ──approve──▶ APPROVED   (terminal, immutable)
  ▲                    │
  └──── return ────────┘
```

`recalculate` is allowed in `DRAFT` only. Nothing transitions out of `APPROVED`: FR-050
routes every later correction into a new `ADJUSTMENT` run. Enforced in the use case *and* by
a partial unique index preventing a second `ORIGINAL` for the same month.

### `Payslip`

| Field | Type | Notes |
|---|---|---|
| `payrollRunId`, `userId` | `String @db.Uuid` | |
| `grossAmount`, `deductionAmount`, `netAmount` | `Decimal @db.Decimal(15, 2)` | |
| `presentDays`, `absentDays`, `lateCount`, `lateMinutes`, `earlyLeaveCount`, `leaveDays`, `officialDutyDays` | `Int @default(0)` | the attendance snapshot the run used |
| `deletedAt` | `DateTime?` | |

- `@@unique([payrollRunId, userId])`
- `@@map("payslips")`

The attendance snapshot is **explicit columns, not JSON**. A payslip must be defensible
years later; columns are typed, queryable, and cannot drift in shape the way a `Json` blob
does. It is a snapshot by design — correcting attendance afterwards does not alter an
approved payslip (FR-050).

### `PayslipLine`

| Field | Type | Notes |
|---|---|---|
| `payslipId` | `String @db.Uuid` | |
| `componentId` | `String? @db.Uuid` | null-safe if a component is later removed |
| `componentCode`, `componentName` | `String @db.VarChar` | denormalised — the payslip must read correctly even if the component is renamed |
| `componentType` | `SalaryComponentType` | |
| `amount` | `Decimal @db.Decimal(15, 2)` | already rounded to whole rupiah (R5) |
| `driver` | `AttendanceDriver?` | |
| `driverCount` | `Int?` | FR-045 — the count used |
| `rate` | `Decimal? @db.Decimal(15, 2)` | FR-045 — the rate used |

- `@@index([payslipId])`
- `@@map("payslip_lines")`

### No new table for salary access

The spec's **Salary Data Access Record** entity is real but is **not** a new model. It maps
onto the existing `AuditLog` (`iam.prisma:52`), written through `CreateAuditLogUseCase` by
`payroll-audit.service.ts`. `AuditLog` already carries actor, action, resource, resourceId,
metadata, IP, user agent, and timestamp — everything FR-052 asks for. Adding a parallel table
would give the school two audit trails to reconcile, which is worse than one.

**Reconciliation invariant (FR-046, SC-015)**: `sum(lines where type ≠ DEDUCTION) = gross`,
`sum(lines where type = DEDUCTION) = deductionAmount`, `gross − deductionAmount = net`, all
in whole rupiah. Asserted in the calculation use case's spec and in the quickstart.

---

## Cross-domain reference summary

| From | To | Mechanism |
|---|---|---|
| `PresenceCredential.userId` | `platform` `User` | Prisma relation — `platform/` is a supplier to all |
| `LeaveRequest.documentFileId` | `platform` `File` | Prisma relation |
| `NonWorkingDay.sourceCalendarId` | `academic` `AcademicCalendar` | **plain column, no FK** — provenance only; the import is composed in the browser (R9) |
| `academic/attendance` → presence | daily records for a date | injected port, in-process (R6) |
| `payroll` → presence | monthly recap per employee | injected port |
| `payroll` → `academic/teacher` | the employee roster | injected `ITeacherRepository` |

Nothing goes from `presence/` to `academic/` in either direction of code or schema, so the
domain graph is one-way: `platform ← presence ← {academic, payroll}`, `academic ← payroll`.

No table in `presence.prisma` or `payroll.prisma` holds a foreign key into an `academic/`
table. That is what keeps Principle VI's ownership boundary real rather than nominal.

---

## Migration notes

- Two `prisma migrate dev` migrations, one per schema file, both additive. **No existing
  table is altered** — `attendances`, `students`, `teachers`, and `academic_calendars` are
  untouched, which is FR-022 enforced structurally rather than by care.
- Seed additions: the default `WorkPattern` (Mon–Thu & Sat 07:00–14:00, Fri 07:00–11:30,
  Sun non-working, 10-minute grace), the four `LeaveType` rows, and the 40 new permission
  codes. All follow `backend/prisma/seeds/modules/` conventions.
- `iam.seed.ts` must grant `ADMIN` every new permission **except** `payroll-*`, exactly as it
  already does for `portal-*` (ADR-0008).
