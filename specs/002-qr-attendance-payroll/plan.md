# Implementation Plan: QR Card Attendance, Leave & Payroll

**Branch**: `002-qr-attendance-payroll` | **Date**: 2026-08-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-qr-attendance-payroll/spec.md`

> **Git note**: the repository is currently on `main` and no feature branch exists — the
> Spec Kit git extension is not installed, so no `before_plan` hook created one. Per the
> constitution's Development Workflow, implementation MUST happen on a branch and merge
> by PR. Create `002-qr-attendance-payroll` before the first commit.

## Summary

Add a QR-card gate presence system serving **both students and employees**, then build the
employee-side consequences on top of it: corrections, working patterns, leave with
approval, and monthly payroll down to a net payslip.

The technical approach turns on one decision: **gate presence is a new domain that neither
academic nor payroll owns, keyed on the user rather than on the student or the teacher.**
Every person in this system already has exactly one `User` — `Student.userId` and
`Teacher.userId` are both required and unique — so a card credential can point at a user
and stay ignorant of whether that person is a pupil or the security guard. That single
choice keeps the dependency graph acyclic: `presence/` depends only on `platform/`, while
`academic/` and `payroll/` depend on `presence/`.

The second decision follows from the first: **a gate scan never writes a per-lesson
attendance row.** When a wali kelas opens today's class, the academic side asks the
presence domain what the gate saw and renders it as a suggestion; the teacher's save is
what writes. This satisfies FR-022 literally (existing per-lesson records are untouched),
avoids a 400-row write fan-out every morning, and keeps the report card's authority
exactly where the spec puts it — with the teacher in the room.

Two new backend domains (`presence/`, `payroll/`), two new Prisma schema files, eleven new
frontend features inside `apps/academic`, and **no new application**. Two ADRs and one
constitution amendment are required before merge.

## Technical Context

**Language/Version**: TypeScript 5.8.3, pinned workspace-wide by `pnpm-workspace.yaml`.
Node ≥ 20.

**Primary Dependencies**: Backend — NestJS, Prisma, PostgreSQL, NodeNext ESM (relative
imports carry `.js`). Frontend — Vue 3 (`<script setup>`), Vite, Tailwind CSS v4,
shadcn-vue + Reka UI, Pinia, Vue Router, vee-validate + Zod, TanStack Vue Table, Axios.
**One new dependency**: `qrcode` (MIT, no peer deps, ~20 KB) in `apps/academic`, to render
the QR onto the printable card sheet, plus `@types/qrcode` as a devDependency — the package
ships no bundled type declarations, and without the types `typecheck` and `lint:strict` fail,
which Principle V forbids resolving by suppression. Justified in Complexity Tracking; no
camera-scanning library is introduced (see research R2).

**Storage**: PostgreSQL via Prisma. Two new per-domain schema files, `backend/prisma/presence.prisma`
and `backend/prisma/payroll.prisma`, per the constitution's split-schema rule. Money uses
`Decimal(15, 2)`, matching the existing `inventory.prisma` precedent.

**Testing**: Backend jest — one `*.spec.ts` per use case (constitution V, non-negotiable),
plus two e2e sweeps modelled on `test/portal-public-visibility.e2e-spec.ts`: a payroll
authorization sweep and a domain-disjointness assertion modelled on
`src/portal/portal-siakad-disjointness.spec.ts`. Frontend vitest for the presence and
payroll services and for the rounding/reconciliation helper.

**Target Platform**: Linux server; modern browsers. The gate kiosk is a browser page on
either a PC with a USB HID barcode scanner (primary) or an Android tablet (secondary).

**Project Type**: pnpm monorepo — four Vue 3 frontends, one NestJS backend. This feature
adds no fifth app.

**Performance Goals**: scan → on-screen confirmation under 2 s (SC-001); one device
sustaining ≥ 20 accepted scans/min (SC-002); monthly recap for all staff under 5 min
(SC-008); full payroll run under 30 min (SC-011).

**Constraints**: recorded times derive from a server-anchored clock, never the device wall
clock (FR-010), which must still hold through a 4-hour offline window (SC-013); components
must reconcile exactly to net in whole rupiah (FR-046, SC-015); no capability may be gated
on a hardcoded position list (FR-056, SC-016).

**Scale/Scope**: single school. Order of 400–600 students and 40–60 employees — call it 660
card holders at the upper bound — so roughly 900–1,300 scans on a normal day, ~250 working
days a year, 12 payroll runs a year. Eleven new backend modules across two domains (six
presence, four payroll, plus the shared attendance-period module); eleven new frontend
features.

## Constitution Check

*GATE: evaluated before Phase 0, re-checked after Phase 1.*

| Principle | Gate | Pre-Phase 0 | Post-Phase 1 |
|---|---|---|---|
| **I. Layered Dependency Flow** | Controller → use case → repository port → Prisma; only `infrastructure/persistence/` imports Prisma; one use case per operation; frontend features carry a `services/` layer | ✅ PASS — planned layout follows it exactly | ✅ PASS — see data-model.md and contracts/; every endpoint maps to one use case |
| **II. Domain Boundaries** | Cross-domain access through a module's public API; no cycles; barrels; no app→app imports | ⚠️ **NEEDS ADR** — two new domains and a new `academic/ → presence/` edge | ✅ PASS with ADR-0007 — graph verified acyclic (research R1) |
| **III. Scoped & Authorized Access** | `deletedAt: null` everywhere; period scoping; permissions not role names; the ADMIN bypass exemption list is an amendment, not config | ⚠️ **NEEDS AMENDMENT** — `payroll-` must join `ROLE_BYPASS_EXEMPT_PREFIXES` | ✅ PASS with ADR-0008 + constitution 1.2.0 |
| **IV. Explicit Contracts** | DTO vs Input separation, field-by-field mapping, `{ statusCode, message, data, meta? }` envelope, no `any`, NestJS exceptions, no domain events | ✅ PASS | ✅ PASS — contracts/ declares explicit response DTOs; no `any`; the one cross-domain consequence is a direct awaited call per ADR-0002 |
| **V. Green Quality Gates** | `validate` green; a `*.spec.ts` per use case; file budgets (use case ≤300, repository ≤200, controller ≤150); comments short; no suppressions | ✅ PASS | ⚠️ **WATCH** — the payroll calculation use case is the one at real risk of exceeding 300 lines; split plan stated below |
| **VI. Data Ownership & Transactions** | A repository queries only its own module's models; no transaction across a module boundary | ⚠️ **WATCH** — payroll must read presence recaps and the employee roster | ✅ PASS — both go through injected ports; the only transactions are same-module (research R5, R8) |

### How the watched items are handled

**Principle V — payroll calculation size.** `CalculatePayrollRunUseCase` naturally attracts
component resolution, attendance aggregation, per-line arithmetic, and rounding. It is
planned as a thin orchestrator over three stateless helpers under
`payroll/run/services/` — `salary-resolver.service.ts` (which assignment was in force),
`attendance-driver.service.ts` (count per driver), `rounding.service.ts` (whole-rupiah
reconciliation). `services/` is exactly the constitution's carve-out for stateless helpers
that are not business operations.

**Principle VI — payroll reading presence and the roster.** `payroll/` injects
`IDailyPresenceRepository`'s exported read port and `ITeacherRepository`, never
`this.prisma.dailyPresence` or `this.prisma.teacher`. A payroll run's writes (run + payslips
+ lines) are same-module and not safe to retry piecemeal, so they take one interactive
transaction — which is squarely inside Principle VI's "reach for a transaction because the
writes are same-module AND not safe to retry".

**Principle III — every query scoped.** Presence and payroll rows are scoped by
`deletedAt: null` plus the relevant period: `date` for daily records, `(year, month)` for
runs and recaps. Presence is deliberately **not** scoped by `semesterId` — an employee's
working day does not belong to an academic semester, and forcing one would be the "tenant
filter the schema cannot honour" that Principle III forbids. Student-side reads that feed
the report card remain semester-scoped on the academic side, unchanged.

## Project Structure

### Documentation (this feature)

```text
specs/002-qr-attendance-payroll/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output — 12 decisions
├── data-model.md        # Phase 1 output — entities, enums, constraints, state machines
├── quickstart.md        # Phase 1 output — runnable validation walkthrough
├── contracts/
│   ├── presence-api.md  # Gate, credential, device, daily record, pattern, leave endpoints
│   ├── payroll-api.md   # Component, assignment, run, payslip endpoints
│   ├── permissions.md   # The 40 new permission codes and their bypass posture
│   └── internal-ports.md# The in-process ports crossing domain boundaries
├── checklists/
│   └── requirements.md  # Spec quality checklist (16/16)
└── tasks.md             # Phase 2 — created by /speckit-tasks, NOT by this command
```

### Source Code (repository root)

```text
backend/prisma/
├── presence.prisma                    # NEW — credentials, devices, scans, daily records,
│                                      #   work patterns, non-working days, leave, periods
└── payroll.prisma                     # NEW — components, assignments, runs, payslips

backend/src/
├── presence/                          # NEW DOMAIN — keyed on userId, knows nothing of
│   │                                  #   classrooms, semesters, or salaries
│   ├── presence.module.ts
│   ├── credential/                    # issue, revoke, replace, card print payload
│   ├── device/                        # gate terminal registry + device token auth
│   ├── scan/                          # ingest (single + offline batch), dedup, clock anchor
│   ├── daily-record/                  # per person per date, corrections, monthly recap,
│   │                                  #   the caller's own record (/me)
│   ├── attendance-period/             # open/closed months — shared by daily-record,
│   │                                  #   work-pattern, and payroll, so it is foundational
│   ├── work-pattern/                  # patterns, per-weekday hours, assignments,
│   │                                  #   non-working days
│   ├── leave/                         # leave types, requests, approvals, balances
│   └── shared/                        # device guard, server clock service, constants
│
├── payroll/                           # NEW DOMAIN — the only place salary data lives
│   ├── payroll.module.ts
│   ├── component/                     # salary component definitions
│   ├── assignment/                    # effective-dated per-employee amounts
│   ├── run/                           # calculate, recalculate, submit, approve
│   │   └── services/                  # salary-resolver, attendance-driver, rounding
│   └── payslip/                       # payslip reads, including "mine"
│
├── academic/attendance/               # MODIFIED — gains a read of presence to pre-fill
│   └── use-cases/get-attendance-suggestions.use-case.ts   # NEW
│
├── platform/access-control/permission/
│   ├── constants/permission-codes.constants.ts            # MODIFIED — +40 codes
│   └── guards/permission.guard.ts                         # MODIFIED — ROLE_BYPASS_EXEMPT_PREFIXES
│                                                          #   gains 'payroll-' (ADR-0008)
└── app.module.ts                      # MODIFIED — register PresenceModule, PayrollModule

apps/academic/src/
├── features/
│   ├── presence/                      # NEW feature group
│   │   ├── kiosk/                     # the gate screen — standalone layout, device token
│   │   ├── credential/                # issue / revoke / print cards
│   │   ├── device/                    # register gate terminals
│   │   ├── employee-attendance/       # daily list, corrections, monthly recap, export
│   │   ├── work-pattern/              # patterns, assignments, non-working days
│   │   ├── leave/                     # request, approve, balances
│   │   └── leave-type/                # @241/master-data config.ts
│   ├── payroll/                       # NEW feature group
│   │   ├── component/                 # @241/master-data config.ts
│   │   ├── assignment/                # per-employee salary setup
│   │   ├── run/                       # create, recalculate, submit, approve, compare
│   │   └── payslip/                   # my payslip + authorised view
│   └── academic/attendance/           # MODIFIED — renders the gate suggestion
├── app/providers/router/index.ts      # MODIFIED — register new route sets
└── config/menuConfig.ts               # MODIFIED — new sidebar sections

docs/adr/
├── 0007-presence-domain.md            # NEW — new domain + dependency direction
└── 0008-narrow-admin-bypass-payroll.md# NEW — payroll- joins the exemption list

.specify/memory/constitution.md        # MODIFIED — 1.1.0 → 1.2.0 (Principle III)
```

**Structure Decision**: two new backend domains under `backend/src/`, each holding sibling
modules in the standard `presentation / use-cases / domain / infrastructure / dto /
constants` layout, and two new feature groups inside the existing `apps/academic`. No
fifth application.

The reasoning is in research R1, but the short form is: a separate app would have to read
the employee roster that lives in `academic/`, and apps in this workspace may not import
each other — so it would either duplicate personnel management or become a shell over
another app's data. The people who correct student attendance already work in
`apps/academic` every day. Separation is bought at the domain layer, where it is cheap and
enforceable, rather than at the app layer, where it is expensive and, per ADR-0005's
reasoning, only justified by a genuinely different audience. The gate kiosk is a route
inside that app; if it ever needs its own deployable, extracting one route is a small job.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| **Two new top-level domains at once** (`presence/`, `payroll/`) — Principle II, Technology | They are different bounded contexts with different lifecycles and, critically, different sensitivity. Presence is read by academic every school day; payroll is read by two people a month and holds every salary in the school. | One domain was rejected because it would put salary tables behind the same permission prefix as a wali kelas's daily attendance screen, making the ADR-0008 bypass narrowing impossible to express. Putting payroll inside `platform/` was rejected because `platform/` is a supplier to everyone, and salary must not be. |
| **`academic/` gains a dependency on `presence/`** — Principle II, new module edge → **ADR-0007** | `academic/attendance` must show the wali kelas what the gate saw. The alternative direction — presence writing per-lesson rows — violates FR-022 and creates a morning write fan-out. | A shared `platform/` mediator was rejected: it would add an indirection whose only job is to hide an edge that is legitimate and one-directional. The graph stays acyclic because presence keys on `userId` and never reads `academic/`. |
| **`payroll-` added to `ROLE_BYPASS_EXEMPT_PREFIXES`** — Principle III explicitly calls this an amendment → **ADR-0008** + constitution **1.2.0** | Without it, every `ADMIN` account reads every salary in the school by virtue of its role. ADR-0006 already established the precedent and the mechanism for exactly this situation. | Relying on not granting the permission was rejected: the bypass ignores grants entirely, so an ungranted permission is no protection. A separate salary role was rejected for the same reason ADR-0006 gave — role-name checks are forbidden by Principle III. |
| **One new frontend dependency: `qrcode`** — Technology constraints require justification | The card sheet must render a scannable QR at print resolution. Hand-rolling QR encoding (Reed–Solomon, mask selection, version sizing) is a genuine algorithm, not a snippet. | Server-side SVG generation was rejected as it adds a backend dependency to save a frontend one, and puts a rendering concern in a use case. A CDN or image API was rejected outright — offline printing must work. **No camera-scanning library is added**: the HID scanner path needs none (research R2). |
| **Device-token auth path alongside the global `JwtAuthGuard`** — a second authentication mechanism | The kiosk is a shared appliance at a gate, not a person. Making it hold a staff member's session would attribute every scan to whoever logged in that morning and leave a full-privilege session unattended at the school entrance. | Reusing a service-account login was rejected for exactly that reason. The mechanism is not novel here — `@PortalPublic()` already establishes how a route opts out of the global guard, and this follows that shape with a narrower, revocable, device-scoped credential. |

### Explicitly NOT taken

- **Renaming `Teacher` to `Employee`.** The roster already holds Bendahara and Staf TU and
  will hold satpam; the name is wrong. Renaming touches 19 academic modules and the
  admission provisioning path, and buys this feature nothing — `presence/` keys on
  `userId` and never names the concept. Recorded in the spec's Assumptions as deferred.
- **Relaxing the required `Teacher.userId`.** Recording a satpam means provisioning a user
  account they may never sign in with. Making it nullable would ripple through every
  join that assumes it. Dormant accounts are the cheaper, reversible choice (research R10).
- **Domain events for the presence → academic hand-off.** ADR-0002 stands: no emitter is
  installed, and the read is a pull, so nothing needs publishing.
