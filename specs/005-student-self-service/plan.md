# Implementation Plan: Separate the student surface from the management surface

**Branch**: `005-student-self-service` | **Date**: 2026-08-14 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/005-student-self-service/spec.md`

## Summary

The academic app offers students four menu entries that lead to staff screens,
and grants the student role the very permissions those screens require over
reads that ignore who is asking. The work adds a self-service boundary —
separate permissions, separate endpoints scoped server-side to the caller,
separate screens — and removes the one place a screen decides what to show by
comparing a role's name to a literal.

It lands in three independently shippable slices, in the order of their urgency:
close the reads (P1), build the screens (P2), drop the role-name branch (P3).

## Technical Context

**Language/Version**: TypeScript 5.8.3 across the workspace; Node 22 LTS

**Primary Dependencies**: NestJS + Prisma 7 (backend); Vue 3 `<script setup>`,
Pinia, Vue Router, vee-validate + Zod, TanStack Vue Table (academic-web)

**Storage**: PostgreSQL 18 in production, 16+ supported. No schema change is
required by this feature — every read it adds is a narrower query over rows that
already exist.

**Testing**: jest for the backend (321 suites today), vitest for the frontends

**Target Platform**: Single-school deployment; one backend instance behind
Nginx, five browser frontends sharing one session

**Project Type**: Web application — `backend/` plus `apps/academic` and the
shared `packages/*`

**Performance Goals**: A student's screens are single-row-set reads scoped to
one person; none should need pagination beyond what already exists. No
measurable change to management screens is acceptable.

**Constraints**: Production is populated through the UI and never runs a seed,
so a new permission must arrive without one. Authorization is by permission,
never by role name, outside `PermissionGuard`.

**Scale/Scope**: ~500 students, ~30 teachers. Four new student screens, one
teacher affordance, five new permissions, six new or narrowed reads.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Assessment |
|---|---|
| **I. Layered Dependency Flow** | Holds. New reads are controller → use case → repository. Resolving a caller to their student or teacher record uses the existing repository ports, injected as abstractions. |
| **II. Domain Boundaries, One Source of Truth** | Holds, with care. Report cards, scores and attendance each need the caller's `studentId`; that resolution belongs to the student module and is consumed through its port, not re-implemented per module. |
| **III. Scoped and Authorized Data Access** | This is the principle the feature exists to restore. Every new read is scoped by the system rather than by a caller-supplied filter, and every one is permission-controlled. No new bypass-exempt prefix is introduced — that would be an amendment (D3). |
| **IV. Explicit Contracts at Every Boundary** | Holds. A DTO is the HTTP shape and an Input is the port shape; the caller's identity enters as a use-case argument, never as a field a DTO could carry. |
| **V. Green Quality Gates** | Unchanged: typecheck, lint, lint:strict, tests and build must be green on both sides before promotion. |
| **VI. Module Data Ownership** | Holds. No module writes another's rows; the additions are reads. |

**Gate result: PASS.** No violations to justify, so Complexity Tracking is
omitted.

One clarification the design must honour rather than skirt: Principle III
forbids "unbounded list reads that ignore the active period". Each student read
falls back to the active semester when none is given.

## Project Structure

### Documentation (this feature)

```text
specs/005-student-self-service/
├── plan.md              # This file
├── research.md          # Phase 0 — six decisions, grounded in the code
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1 — how to prove it
├── contracts/           # Phase 1 — the endpoints this adds
└── tasks.md             # Phase 2, by /speckit-tasks — not created here
```

### Source Code (repository root)

```text
backend/src/
├── platform/access-control/permission/
│   ├── constants/permission-codes.constants.ts   # five new codes
│   └── use-cases/sync-permissions.use-case.ts    # run on bootstrap (D4)
├── academic/
│   ├── report-card/          # + GET /rapors/me, caller-scoped
│   ├── assessment/           # + GET /student-scores/me
│   ├── attendance/           # + GET /academic/attendances/me
│   ├── schedule/             # + GET /schedules/me
│   └── student/              # + caller scoping on GET /students
└── prisma/seeds/modules/iam.seed.ts               # student role → -own codes

apps/academic/src/
├── config/menuConfig.ts                            # four entries repointed
└── features/academic/
    ├── schedule/views/MyScheduleView.vue           # beside ScheduleView.vue
    ├── attendance/views/MyAttendanceView.vue       # beside AttendanceView.vue
    ├── student-score/views/MyScoreView.vue         # beside StudentScoreGradingView.vue
    ├── rapor/views/MyRaporView.vue                 # beside RaporView.vue
    └── schedule/composables/useSchedule.ts         # role-name branch removed

packages/platform/src/features/auth/
└── types/session.ts                                # dead student/teacher fields removed
```

**Structure Decision**: Each student screen is a **new view inside the existing
feature folder** for its domain, not a new feature folder.

This corrects a first draft of this plan, which proposed `my-schedule/`,
`my-rapor/` and so on. That reading was wrong on the repository's own terms:
the rule is one *domain* per feature, and "a student's report card" is not a
different domain from "a report card" — it is a different audience for the same
one. Splitting by audience would put two features on one domain and duplicate
its types and API layer.

The precedent settles it. `apps/presence/src/features/presence/leave/` holds
`LeaveApprovalView.vue` and `MyLeaveView.vue` side by side, with one `api/`,
one `services/`, one `types/`, and a separate columns file per audience.
`employee-attendance/` does the same with `EmployeeAttendanceView.vue`,
`MonthlyRecapView.vue` and `MyAttendanceView.vue`. That is the shape to copy.

What must stay separate is the **view**, not the folder: no screen renders one
of two audiences by condition, which is the defect being removed.

## Delivery slices

The three user stories map to three commits that can ship on their own, in this
order. Nothing later is required for something earlier to be correct.

| Slice | Delivers | Safe to stop after? |
|---|---|---|
| **P1** | Permissions, caller-scoped reads, student role moved onto `-own` | Yes — the exposure is closed; the four menu entries fail honestly (FR-008) |
| **P2** | Four student screens, menu repointed | Yes — the surface is complete for students |
| **P3** | Schedule affordance by permission; role-name branch and dead session fields removed | Yes |

## Notable risks and how the design answers them

**A caller-supplied filter quietly widening a scoped read.** The presence
precedent spreads the query first and the identity second —
`execute({ ...query, requesterId: user.id })`. Reversing that order would let a
caller override their own identity. Every new read follows the same order, and
the contract tests assert it by passing a foreign identifier and expecting it to
change nothing.

**`me` parsed as a uuid.** `/rapors/:id` and friends already exist, and Nest
matches in registration order. Each `.../me` route is declared before its `:id`
sibling, as presence's leave controller documents at the point of declaration.

**A permission that exists in code but not in the database.** Addressed by D4 —
sync on bootstrap — and provable: the quickstart lists the query that shows the
five codes present after a deploy.

**Losing management behaviour while narrowing.** Every management route keeps its
permission and its shape. The regression check is that staff-facing screens are
untouched (SC-005), which the existing suites already cover; new tests assert the
scoped variants rather than modifying the existing ones.
