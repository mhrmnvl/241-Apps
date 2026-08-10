# Contract: Internal Ports

**Feature**: `002-qr-attendance-payroll`

Three in-process calls cross a domain boundary. Each is a direct awaited call to an exported
use case or repository port — never HTTP, never Prisma across the boundary, never an event
(ADR-0002: no emitter is installed, and all three are reads).

Constitution Principle VI is the rule these implement: a repository queries only the models
its own module owns; reading another module's data goes through that module's injected port.

---

## Port 1 — `academic/attendance` → `presence/daily-record`

**Why**: the wali kelas's class view pre-fills from the gate (FR-017). Pull, not push
(research R6).

Exported by `presence/daily-record/index.ts`:

```ts
export interface GateSuggestion {
  userId: string;
  status: PresenceDayStatus;
  checkInAt: Date | null;
  lateMinutes: number;
}

export abstract class IDailyPresenceReadPort {
  abstract findByUsersAndDate(
    userIds: string[],
    date: Date,
  ): Promise<GateSuggestion[]>;

  abstract summariseMonth(
    userIds: string[],
    year: number,
    month: number,
  ): Promise<MonthlyPresenceSummary[]>;
}
```

Consumed by a new `academic/attendance/use-cases/get-attendance-suggestions.use-case.ts`,
which:

1. resolves the classroom's enrolments to `userId`s through `IStudentRepository` (already
   available in `academic/`),
2. calls `findByUsersAndDate`,
3. returns suggestions marked unconfirmed.

**Direction is one-way.** `presence/` never imports anything from `academic/`, which is what
keeps the graph acyclic (research R1). `presence/` cannot resolve a classroom — it does not
know classrooms exist — so the caller supplies the user IDs.

**Failure policy**: presence being unavailable must not stop a teacher taking attendance. The
use case catches, logs at warn level, and returns an empty suggestion set. The class view then
behaves exactly as it does today — every student needing a decision — which is a degraded
convenience, not a degraded record.

---

## Port 2 — `payroll/run` → `presence/daily-record`

**Why**: `attendance-driver.service.ts` needs each employee's month.

Uses `IDailyPresenceReadPort.summariseMonth` above:

```ts
export interface MonthlyPresenceSummary {
  userId: string;
  presentDays: number;
  absentDays: number;
  lateCount: number;
  lateMinutes: number;
  earlyLeaveCount: number;
  leaveDays: number;
  officialDutyDays: number;
}
```

**Precondition**: the run refuses to start unless the `AttendancePeriod` is `CLOSED`
(`409`). Payroll therefore reads figures that cannot move underneath it, and the payslip's
stored snapshot preserves them regardless.

**No transaction spans this call.** The read completes, then payroll opens its own
same-module transaction for the run's writes. A transaction across the boundary is exactly
what ADR-0003 and Principle VI forbid.

---

## Port 3 — `payroll/run` → `academic/teacher`

**Why**: the roster of employees to pay, and the position and NIP a payslip displays.

Uses the existing exported `ITeacherRepository`. No new port. Payroll calls its list method
with no position filter and reads `userId`, display name, position, and NIP — which is what
makes FR-056 structural: payroll asks for *the roster*, and there is no position parameter for
a future edit to narrow.

**Not the reverse.** `academic/` never reads payroll. Salary data has exactly one consumer
boundary, and it points inward.

---

## Deliberately NOT a port — holiday import

Importing holidays into `NonWorkingDay` (research R9) looks like it wants a fourth port,
`presence/work-pattern → academic/calendar`. **It must not have one.**

Ports 1 and 2 already establish `academic/ → presence/`. A backend call in the other
direction would close a cycle at domain granularity, and the whole point of keying presence
on `userId` (research R1) was to keep that graph one-way.

**Instead the import is composed in the browser**, where both permissions already exist:

1. The presence UI calls the existing `GET /academic/calendars?academicYearId=&typeId=`.
2. It shows the operator which dates would be imported, as a preview.
3. On confirm, it POSTs those dates to `POST /presence/non-working-days/bulk` — a plain
   presence-owned write taking `[{ date, name, sourceCalendarId }]`.

The backend edge disappears entirely, and the operator gets a preview before committing —
which is better than a blind server-side import for an action that changes what counts as a
working day for everyone.

`sourceCalendarId` is carried through as a plain column for provenance. It is **not** a
foreign key; presence stores where a date came from without depending on that table
continuing to exist.

> Consequence for [presence-api.md](./presence-api.md): `POST /presence/non-working-days/import`
> is replaced by `POST /presence/non-working-days/bulk`, which takes explicit dates and reads
> nothing from `academic/`.

---

## Summary

| Port | From | To | Kind | Path |
|---|---|---|---|---|
| 1 | `academic/attendance` | `presence/daily-record` | read | `IDailyPresenceReadPort.findByUsersAndDate` |
| 2 | `payroll/run` | `presence/daily-record` | read | `IDailyPresenceReadPort.summariseMonth` |
| 3 | `payroll/run` | `academic/teacher` | read | `ITeacherRepository` (existing) |
| — | holiday import | — | **frontend-composed, no backend edge** | see above |

All three ports are reads. No write crosses a domain boundary in this feature, so no
transaction needs to either.

**Resulting domain graph** — acyclic, one direction:

```
platform/  ←── presence/          presence depends on platform alone
presence/  ←── academic/          (Port 1)
presence/  ←── payroll/           (Port 2)
academic/  ←── payroll/           (Port 3)
```
