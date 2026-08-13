# Implementation Plan: Fetch Only What Is Shown

**Branch**: `004-reduce-overfetching` | **Date**: 2026-08-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-reduce-overfetching/spec.md`

## Summary

Stop reading columns nobody displays, stop fetching lists nobody opened, and stop
re-fetching lists that have not changed.

Three things carry the work. On the backend, three named person projections replace
19 whole-record reads, and the six-level profile read splits into three shallower ones
behind an unchanged response. On the frontend, dialog-only lists move into their
dialogs, and a reference-data store in `@241/platform` lets ten rarely-changing lists
be retrieved once per visit instead of once per page.

The one thing research changed about the approach: the audit's proposal of a single
`{ name }` shape is wrong. Four visible columns and every avatar read more than a
name, so there are three shapes, not one — see [research.md](./research.md) R1.

## Technical Context

**Language/Version**: TypeScript 5.8.3 across the workspace

**Primary Dependencies**: NestJS + Prisma 7 (backend); Vue 3, Pinia, Vue Router, Axios
(five frontends). **No new dependency is added** — see Constitution Check.

**Storage**: PostgreSQL (Neon). No schema change, no migration.

**Testing**: jest (backend, 1,914 tests); vitest (apps and packages, 235 tests)

**Target Platform**: Node ≥ 20 API server; evergreen browsers

**Project Type**: pnpm monorepo — five Vue frontends, one NestJS backend, four shared
packages

**Performance Goals**: Relative, not absolute. Measured as request count and payload
size against a baseline captured before any edit, on six named screens
(see [quickstart.md](./quickstart.md) Step 1).

**Constraints**: No user-visible behaviour change (FR-013). No response field removed
without proving nothing reads it. Documents rendered for people — the rapor PDF, the
student spreadsheet — are out of scope.

**Scale/Scope**: 19 whole-record reads across 14 files in 6 backend domains; ~10
reference lists shared by 5 apps; 42 files use the 1,000-row reference cap, of which
only the dialog-fed subset moves.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Assessment | Verdict |
|---|---|---|
| **I. Layered architecture** | Projections live in `infrastructure/persistence`, where includes already live. Use cases and controllers are untouched. | PASS |
| **II. Domain boundaries** | The shared shapes go in `backend/src/shared/domain/` — constants with no business logic, which `shared/` explicitly permits. The alternative, importing them from `platform/profile`, would make five domains depend on a sibling feature to read a name. The frontend store goes in `@241/platform`, used by two or more apps, which is where the rule says shared code belongs. | PASS |
| **III. Scoped data access** | This narrows what is read. No permission check, role bypass or scoping rule changes. | PASS |
| **IV. Testing** | No behaviour changes, so the existing suites are the regression net; new tests cover the cache's expiry and single-flight rules, which are new behaviour. | PASS |
| **V. Technology constraints** | **No cross-cutting dependency is added.** TanStack Query was evaluated and rejected — see [research.md](./research.md) R4. The reference store uses Pinia, already present in all five apps. | PASS |
| **Backend language rule** | Every constant, comment and message added here is English. | PASS |

No violations. Complexity Tracking is therefore omitted.

**Post-design re-check**: the Phase 1 artifacts introduce no new module, dependency or
endpoint. `contracts/read-projections.md` C1 makes the compatibility promise explicit,
which strengthens rather than weakens Principle II. Still PASS.

## Project Structure

### Documentation (this feature)

```text
specs/004-reduce-overfetching/
├── spec.md              # What and why
├── plan.md              # This file
├── research.md          # Phase 0 — six decisions, measured against the code
├── data-model.md        # Phase 1 — the projections and the cache entity
├── quickstart.md        # Phase 1 — how to prove it works, baseline first
├── contracts/
│   └── read-projections.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 — created by /speckit-tasks, not here
```

### Source Code (repository root)

```text
backend/src/
├── shared/domain/
│   └── prisma-selects.ts                    # NEW — the three person shapes
├── platform/
│   ├── auth/infrastructure/persistence/     # findUserById drops profile: true
│   └── profile/infrastructure/persistence/  # USER_DETAIL_SELECT splits in three
├── academic/
│   ├── student|teacher/…/persistence/       # roster shape (name, gender, nik)
│   ├── schedule|attendance|assessment/      # name shape
│   ├── classroom|enrollment|graduation/     # name shape
│   └── report-card/…/persistence/           # name shape
├── admission/…/persistence/                 # name shape
├── inventory/…/persistence/                 # bare includes → explicit selects
└── portal|presence/…/persistence/           # already correct — reference only

packages/platform/src/features/
└── reference-data/                          # NEW — the shared cache
    ├── stores/referenceDataStore.ts
    ├── composables/useReferenceList.ts
    └── index.ts

apps/academic/src/features/academic/
├── curriculum-subject/                      # subject list moves into its dialog
├── classroom/                               # reads reference lists from the cache
├── teaching-assignment/
└── attendance/
```

**Structure Decision**: Existing layout throughout. One new backend file
(`shared/domain/prisma-selects.ts`) and one new platform feature
(`reference-data/`), following the feature-per-domain layout the workspace already
uses. Everything else is an edit to an existing `*.includes.ts` or view.

## Phasing

Ordered so each phase is independently shippable and independently revertible.

| Phase | Delivers | Depends on |
|---|---|---|
| **0. Baseline** | Numbers for six screens, written to `baseline.md` | — |
| **1. Projections** | The three shapes; all 19 sites converted; `profile: true` gone | Phase 0 |
| **2. Session and profile** | `/auth/me` narrowed; `USER_DETAIL_SELECT` split in three | Phase 1 |
| **3. List vs detail** | Student and teacher list stop fetching detail data | Phase 1 |
| **4. Dialog loading** | Dialog-only lists move into their dialogs | — |
| **5. Reference cache** | The store, then adoption screen by screen | — |
| **6. Re-measure** | Numbers beside the baseline; rules written into CLAUDE.md | All |

Phases 4 and 5 are frontend-only and can proceed alongside 1–3.

## Risks

| Risk | Why it matters | Handling |
|---|---|---|
| A shape is applied to the wrong site and a column blanks | The most likely defect, and it is silent — no error, just an empty cell | The four screens that read beyond a name are listed in quickstart Step 2 and checked by eye every phase |
| `avatarFileId` selected instead of the `avatarFile` relation | Compiles, returns null, every avatar disappears | Called out in data-model.md; the display shape carries the relation |
| Splitting the profile read changes the merged response | Breaks `ProfileView` | C1 makes the response a fixed contract; the split is verified by comparing bodies before and after |
| Cache serves a stale list after a write | A teacher picks a classroom that was renamed | Writes expire their list (C3); tested |
| Scope creep into searchable pickers | The 1,000-row cap invites it | Explicitly out of scope in the spec; R5 records why |
