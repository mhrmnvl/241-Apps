# Contract: Payroll API

**Feature**: `002-qr-attendance-payroll` | Domain: `backend/src/payroll/`

Same envelope and error conventions as [presence-api.md](./presence-api.md).

**Every route here carries a `payroll-*` permission, and `payroll-` is exempt from the
`ADMIN` role bypass (ADR-0008).** Holding `ADMIN` grants nothing in this file; the permission
must be granted explicitly. `SUPER_ADMIN` retains its break-glass bypass.

---

## Salary components — `payroll/component`

| Method | Path | Permission |
|---|---|---|
| `GET` | `/payroll/components` | `payroll-components.read` |
| `POST` | `/payroll/components` | `payroll-components.create` |
| `PATCH` | `/payroll/components/:id` | `payroll-components.update` |
| `DELETE` | `/payroll/components/:id` | `payroll-components.delete` |

```jsonc
// POST body
{
  "code": "POT_ALPA",
  "name": "Potongan Alpa",
  "type": "ATTENDANCE_DRIVEN",   // BASE | ALLOWANCE | ATTENDANCE_DRIVEN | DEDUCTION
  "driver": "ABSENT_DAYS"        // required iff type = ATTENDANCE_DRIVEN, else must be absent
}
```

`driver` is required on `ATTENDANCE_DRIVEN`, **allowed on `DEDUCTION`**, and forbidden on
`BASE` / `ALLOWANCE` → `422` otherwise. The type decides the **sign**; the driver decides
whether the amount is fixed or counted. They are separate questions: "potongan alpa" is both a
`DEDUCTION` and driven by `ABSENT_DAYS`, and conflating the two is how absences end up
*increasing* someone's pay.

An assignment supplies a `rate` when the component has a driver and an `amount` when it does
not — the driver, not the type, decides which. Deleting a
component referenced by any assignment or payslip line soft-deletes it; `PayslipLine` keeps
`componentCode` and `componentName` denormalised so historical payslips still read correctly.

Reference data — the frontend drives this through a `@241/master-data` `config.ts` (ADR-0001).

---

## Salary assignments — `payroll/assignment`

| Method | Path | Permission |
|---|---|---|
| `GET` | `/payroll/assignments` | `payroll-salaries.read` |
| `GET` | `/payroll/assignments/user/:userId` | `payroll-salaries.read` |
| `POST` | `/payroll/assignments` | `payroll-salaries.update` |
| `DELETE` | `/payroll/assignments/:id` | `payroll-salaries.update` |

```jsonc
// POST body
{
  "userId": "uuid",
  "componentId": "uuid",
  "amount": "3500000.00",     // for BASE | ALLOWANCE | fixed DEDUCTION
  "rate": null,               // for ATTENDANCE_DRIVEN, per unit of the driver
  "effectiveFrom": "2026-08-01"
}
```

**`payroll-salaries.update` is deliberately not `payroll-runs.create`** (FR-043): the person
who calculates the month must not be able to decide what anyone is paid — including
themselves. Acceptance Scenario 6.4 tests exactly this pair.

Posting an assignment for a `(userId, componentId)` that already has an open one closes the
existing row with `effectiveTo = effectiveFrom − 1 day` and inserts the new one, in one
same-module transaction. Amounts are **never** updated in place — that is what lets an
earlier month be recalculated and reproduce its original figures.

Exactly one of `amount` / `rate` must be present, matching the component's type → `422`
otherwise.

---

## Payroll runs — `payroll/run`

| Method | Path | Permission |
|---|---|---|
| `GET` | `/payroll/runs` | `payroll-runs.read` |
| `GET` | `/payroll/runs/:id` | `payroll-runs.read` |
| `POST` | `/payroll/runs` | `payroll-runs.create` |
| `POST` | `/payroll/runs/:id/recalculate` | `payroll-runs.update` |
| `POST` | `/payroll/runs/:id/submit` | `payroll-runs.update` |
| `POST` | `/payroll/runs/:id/approve` | `payroll-runs.approve` |
| `GET` | `/payroll/runs/:id/payslips` | `payroll-payslips.read` |

### `POST /payroll/runs`

```jsonc
{ "year": 2026, "month": 7, "kind": "ORIGINAL" }
```

**Preconditions**, each its own error rather than a generic failure:

| Condition | Response |
|---|---|
| The attendance period is not `CLOSED` | `409` — "Periode kehadiran belum ditutup" |
| An `ORIGINAL` run already exists for the month | `409` — create an `ADJUSTMENT` instead |
| An employee in scope has no salary assignment | `422` listing them (spec edge case — never silently zero) |

Calculation, per employee on the roster active during the month:

1. Resolve the assignments in force on the period's last day (`salary-resolver.service.ts`).
2. Pull the month's attendance summary from presence through its port
   (`attendance-driver.service.ts`) — never `this.prisma.dailyPresence`.
3. For each component, compute the line: fixed → `amount`; driven → `rate × driverCount`.
4. Round each line half-up to whole rupiah (`rounding.service.ts`, research R5).
5. Sum rounded lines into `gross`, `deductionAmount`, `netAmount`.

All writes (run + payslips + lines) land in one interactive transaction — same-module and
not safe to apply piecemeal, which is Principle VI's stated trigger.

### `GET /payroll/runs/:id`

```jsonc
{
  "id": "uuid", "year": 2026, "month": 7,
  "kind": "ORIGINAL", "sequence": 1, "status": "DRAFT",
  "roundingRule": "HALF_UP_RUPIAH",
  "totals": { "employeeCount": 47, "gross": "168750000",
              "deductions": "3420000", "net": "165330000" },
  "createdBy": { "id": "uuid", "displayName": "…" },
  "submittedBy": null, "approvedBy": null, "approvedAt": null,
  "previousDraft": {                       // present only after a recalculate — FR-044
    "net": "165100000.00",
    "changedPayslips": [ { "userId": "uuid", "displayName": "…",
                           "previousNet": "3200000.00", "currentNet": "3430000.00" } ]
  }
}
```

### `POST …/recalculate`

Allowed in `DRAFT` only (`409` otherwise). Recomputes from current attendance and returns the
run with `previousDraft` populated, so the change is visible rather than silent (FR-044,
Acceptance Scenario 6.6).

### `POST …/submit` · `POST …/approve`

`DRAFT → SUBMITTED → APPROVED`. `approve` requires `payroll-runs.approve`, refuses with `403` when the approver created the
run, and stamps `approvedAt`. The refusal is flat — there is no override permission, because
the role split already separates the two (TU creates, Kepala Sekolah approves) and a code
nothing seeds would be worse than saying no. **`APPROVED` is terminal**: every mutating route on the run afterwards
returns `409` with "Run sudah disetujui — gunakan adjustment run" (FR-049, FR-050).

---

## Payslips — `payroll/payslip`

| Method | Path | Permission |
|---|---|---|
| `GET` | `/payroll/payslips/me` | `payroll-payslips.read-own` |
| `GET` | `/payroll/payslips/:id` | `payroll-payslips.read` |

```jsonc
{
  "id": "uuid",
  "run": { "year": 2026, "month": 7, "kind": "ORIGINAL", "status": "APPROVED" },
  "employee": { "userId": "uuid", "displayName": "Ahmad Fauzi", "identifier": "…" },
  "attendance": { "presentDays": 19, "absentDays": 1, "lateCount": 3, "lateMinutes": 47,
                  "earlyLeaveCount": 0, "leaveDays": 1, "officialDutyDays": 0 },
  "lines": [
    { "componentCode": "GAJI_POKOK", "componentName": "Gaji Pokok",
      "componentType": "BASE", "amount": "3500000" },
    { "componentCode": "POT_ALPA", "componentName": "Potongan Alpa",
      "componentType": "DEDUCTION", "amount": "150000",
      "driver": "ABSENT_DAYS", "driverCount": 1, "rate": "150000" }
  ],
  "gross": "3650000", "deductions": "150000", "net": "3500000"
}
```

`/me` resolves from the authenticated user and **cannot** be pointed at anyone else — there is
no `userId` parameter to abuse. It serves **approved runs only**: a draft is still being
recalculated, and an employee shown a figure that later moves has been misinformed by the
system rather than served by it. It takes optional `year` and `month`; without them it returns
the most recent approved payslip.

The employee block carries `userId`, `displayName` and `identifier` — deliberately **not**
position or employment type. Payroll must not read a position for anything (FR-056), and a
payslip that names one would be the first place that dependency crept back in. `GET /payroll/payslips/:id` requires the broader
`payroll-payslips.read`; an employee reaching for another's payslip with only `read-own` gets
`403` and the attempt is recorded (FR-052).

`amount` values are whole-rupiah strings. They are strings, not numbers, because JSON numbers
are IEEE-754 doubles and a salary is the last place to accept that — the frontend formats them
with `Intl.NumberFormat`.

---

## Access recording

Every request in this file — successful or refused — writes an `AuditLog` row via
`CreateAuditLogUseCase`, following `PostAuditService`'s pattern and its failure policy: the
write is awaited so a slow audit table surfaces as a slow request, and a failure is logged at
error level rather than thrown, because the read it describes already happened.

This is what FR-052 and SC-012 verify against. The portal is currently the only module writing
audit rows; payroll becomes the second, and the first where the trail is the control rather
than a convenience.
