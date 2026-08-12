# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository overview

pnpm monorepo for the information system of MTs Persis 241 Al-Ikhlash: five Vue 3
frontends sharing code via workspace packages, plus one NestJS + Prisma backend, all
in a single workspace/git repo.

| Path | Package | Description |
|---|---|---|
| `apps/academic` | `academic-web` | SIAKAD 241 — academic info system (students, staff, curriculum, schedule, grades) |
| `apps/inventory` | `inventory-web` | SIMAS 241 — asset management (assets, circulation, approval) |
| `apps/admission` | `admission-web` | Admission app |
| `apps/portal` | `portal-web` | Portal 241 — the school's public website plus the management area for its content (see ADR-0005) |
| `apps/presence` | `presence-web` | SIPRES 241 — gate presence, leave, and payroll (see ADR-0009) |
| `packages/ui` | `@241/ui` | shadcn-vue components + `cn()` util, shared by all apps |
| `packages/shared` | `@241/shared` | Composables, utils, types, config — cross-app |
| `packages/master-data` | `@241/master-data` | Reference-data CRUD engine (list view, form dialog, schema/column generation) driven by a per-entity `config.ts` — see ADR-0001 |
| `packages/platform` | `@241/platform` | Shared platform features (auth, profile, dashboard, role, etc.) |
| `backend` | `backend` | NestJS + Prisma REST API |

Frontend packages are consumed directly as TypeScript source (no build step) via path
aliases — there is no publish/build step between packages and apps.

## Commands

Install once from the root — pnpm links all workspaces:

```bash
pnpm install
```

### Dev servers

```bash
pnpm dev:academic      # http://localhost:5173
pnpm dev:inventory
pnpm dev:admission
pnpm dev:portal        # http://localhost:5176
pnpm dev:presence
pnpm --filter backend dev   # nest start --watch, http://localhost:3000
```

Each frontend app reads `VITE_API_BASE_URL` from `apps/<app>/.env` (copy from
`.env.example`).

### Build & quality checks — frontend (root scripts target all `*-web` packages)

```bash
pnpm build            # production build, all frontend apps
pnpm typecheck        # vue-tsc, all frontend apps
pnpm lint             # ESLint, all frontend apps
pnpm lint:strict      # type-aware ESLint, all frontend apps
pnpm test             # vitest, all frontend apps + @241/* packages
pnpm format:check     # Prettier check, all frontend apps
```

> Root scripts filter by package name (`*-web`), not by path (`./apps/*`). pnpm's
> path filter is case-sensitive against cwd casing, so on Windows a path filter can
> silently match nothing (green script that runs nothing) — always use the name
> filter shown above.

> `test` is the one root script that also covers `@241/*`, because three of the six
> vitest suites live in `packages/master-data`, `packages/platform`, and
> `packages/shared` rather than in an app. It deliberately excludes `backend`, which
> runs jest through its own filter. Packages with no `test` script are skipped
> (`@241/ui` has none).

Per-app (substitute `academic-web` / `inventory-web` / `admission-web` / `portal-web` /
`presence-web`):

```bash
pnpm --filter inventory-web dev
pnpm --filter inventory-web build
pnpm --filter inventory-web lint
pnpm --filter inventory-web lint:strict
pnpm --filter inventory-web validate   # format:check + lint + typecheck + lint:strict + build
```

### Backend (own tooling — always run through its filter, not root scripts)

```bash
pnpm --filter backend dev
pnpm --filter backend build            # nest build
pnpm --filter backend lint             # ESLint (max-warnings=0)
pnpm --filter backend lint:strict      # type-aware ESLint (eslint.typecheck.config.mjs)
pnpm --filter backend typecheck        # tsc --noEmit
pnpm --filter backend test             # jest, src/**/*.spec.ts
pnpm --filter backend test:watch
pnpm --filter backend test:cov
pnpm --filter backend test:e2e         # jest -c test/jest-e2e.json
pnpm --filter backend validate         # format:check + lint + typecheck + lint:strict + test + build
pnpm --filter backend prisma:generate
pnpm --filter backend prisma:migrate   # prisma migrate dev
pnpm --filter backend prisma:deploy    # prisma migrate deploy
```

Run a single backend test file directly with jest, e.g.:

```bash
pnpm --filter backend exec jest src/academic/student/use-cases/create-student.use-case.spec.ts
```

### Pre-commit

Husky + lint-staged runs on staged files. Backend files (path contains `backend/`)
are linted with the backend's own ESLint config; frontend files with the root one.
Both get Prettier.

### Adding shadcn-vue components

UI components live in `packages/ui`; run the CLI from there (config:
`packages/ui/components.json`):

```bash
pnpm --filter @241/ui dlx shadcn-vue@latest add <component>
```

## Frontend architecture

Vue 3 Feature-Driven Architecture, strict domain-per-feature: **1 domain = 1
feature**. Applies to `apps/*/src/features/*` and `packages/platform/src/features/*`.

```text
feature-name/
├── api/            # HTTP calls only, scoped to this domain
├── services/       # business logic
├── stores/         # Pinia state
├── composables/    # reusable logic
├── components/     # feature-internal UI
├── views/          # pages (optional)
├── types/          # feature-specific types/interfaces
└── index.ts        # public API — everything is exported through here
```

Boundary rules:

- Apps may only import a package through its public alias — `@/ui`, `@/shared`,
  `@/master-data`, `@/features/platform/<feature>`. Subpath imports under `@/ui/*`,
  `@/shared/*`, and `@/master-data/*` are part of that public surface. A platform
  **feature barrel** is not: import from `@/features/platform/auth`, never from
  `@/features/platform/auth/stores/authStore`.
- Code used by two or more apps → promote to `packages/*`. Code specific to one app
  (e.g. `menuConfig`, `AppSidebar`) stays in that app.
- `@241/platform` may depend on `@241/ui`, `@241/shared`, and `@241/master-data`,
  never the reverse. `@241/master-data` depends on `@241/ui` + `@241/shared` only —
  it must never import `@241/platform` (ADR-0001: that cycle is why it is its own
  package).
- **No app imports another app.** Where one needs another's data it calls the HTTP
  API and declares its own narrow read models. `presence-web`'s `features/lookup` is
  the reference: five read-only calls into academic's endpoints, typed to just the
  fields it uses. Nothing outside `lookup/` may reach academic by another path
  (ADR-0009).

Path aliases (see `apps/*/vite.config.ts` and `tsconfig.app.json`):

- `@/*` → app's own `src/*`
- `@/ui`, `@/ui/*`, `@/ui/utils` → `packages/ui/src`
- `@/shared/*` → `packages/shared/src`
- `@/master-data`, `@/master-data/*` → `packages/master-data/src`
- `@/features/platform/*` → `packages/platform/src/features`

### Per-app branding

The `auth` feature in `@241/platform` is brand-neutral by default; each app
configures it in `apps/<app>/src/app/main.ts`:

```ts
import { configureAuth } from '@/features/platform/auth'

configureAuth({
  appTitle: 'SIMAS 241',
  appSubtitle: 'Sistem Informasi Manajemen Aset',
  logoAlt: 'SIMAS Logo',
  loginTitle: 'Masuk ke SIMAS',
})
```

### One session, five apps

The refresh cookie is set by the **backend**, on the API host — not by any
frontend — so all five apps share one session (ADR-0010). Signing in through
any of them signs in to all; login pages stay per-app and are simply never
reached again. Three rules follow:

- **`GET /auth/me` is the only source of "who is signed in"** — identity, roles,
  and permissions. Both signing in and restoring a session go through
  `authIdentityService.fetchIdentity()`, so they cannot disagree. Do not read
  authorization from `/profiles/me`: that is the profile page's six-level graph,
  and it is fetched after mount for display data only.
- **`localStorage['241_auth_user']` is a per-origin cache, never the session.**
  The key is declared once, in `@241/shared/constants/storage`. An app whose
  cache is empty re-derives it from the cookie rather than showing a login form.
- **Every frontend must share a registrable domain with the API.** The cookie is
  `sameSite: 'strict'`, so a frontend on a foreign domain gets no cookie and
  therefore no login at all — and this cannot reproduce locally, where every app
  is `localhost`. Stated in each `apps/*/.env.example`.

### Tech stack

Vue 3 (Composition API, `<script setup>`) · TypeScript · Vite · Tailwind CSS v4 ·
shadcn-vue + Reka UI · Pinia · Vue Router · vee-validate + Zod · TanStack Vue Table ·
Lucide · Axios · FullCalendar.

## Backend architecture

NestJS modular monolith, Prisma ORM, PostgreSQL, RBAC + permission-based
authorization. Authoritative backend docs: `backend/docs/NESTJS-RULES.md` (coding
rules — kept in sync with the code) and `backend/docs/IAM.md` (auth/roles/permissions
design) — read these before making non-trivial backend changes. Earlier planning
artifacts and completed one-off runbooks have been deleted rather than archived: a
stale doc that contradicts the code is worse than no doc. Recover one from git history
if you ever need it; treat the code, this file, and `docs/adr/` as the source of truth.

`portal/` is the fourth frontend's backend domain: seven sibling modules (`post`,
`taxonomy`, `media`, `homepage`, `page`, `agenda`, `gallery`) plus a `shared/`
folder for the response cache and the `@PortalPublic()` decorator. Two things
about it are load-bearing and easy to break:

- **Public visibility is a read-time predicate**, defined once per model in
  `*.where.ts` and composed by every public query. A hand-rolled filter anywhere
  else is a silent leak of unpublished content;
  `test/portal-public-visibility.e2e-spec.ts` is the sweep that catches it.
- **`PortalHtmlModule` must stay last** in `PortalModule`'s imports. Its only
  controller answers `GET *` to serve the SPA shell with injected link-preview
  metadata, and Nest matches controllers in registration order — a module listed
  after it never receives a request.

Top-level domains under `backend/src/`: `core/` (infra: config, database,
decorators, filters, interceptors, logger, storage, health, cache, types — the
guards live with their feature, in `platform/auth/` and
`platform/access-control/permission/`), `shared/` (helpers,
types, dto, validators — no business logic), `platform/` (auth, user, role,
permissions, session, audit-log, profile, school-unit, dashboard, notification,
file, settings, master-data, ...), `academic/` (student, teacher, classroom,
curriculum, subject, schedule, assessment, attendance, report-card, enrollment,
graduation, ...), `inventory/` (asset, circulation, approval, master-data),
`admission/`, `portal/`, `presence/` (credential, device, scan, daily-record,
work-pattern, leave, attendance-period, shared), `payroll/` (component,
assignment, run, payslip, shared). `src/types/` holds ambient declarations only
(`express.d.ts`) — it is not a domain. New modules are registered in `src/app.module.ts`.

`platform/`, `academic/`, `inventory/`, `portal/`, `presence/`, and `payroll/` are
**domains containing sibling modules**;
each module owns the layered layout below. `admission/` is the exception — it is
currently one flat module holding four repository interfaces (wave, announcement,
applicant, application), five controllers, and 31 use cases. That is technical debt,
not a second valid layout: prefer splitting along its existing repository seams over
adding to the flat structure.

`presence/` is gate presence — one row per person per day, keyed on `userId`, fed
by a QR scan at the gate. It is **not** `academic/attendance`, which stays per-lesson
and is untouched by it (ADR-0007). Both `presence/` and `payroll/` are served to
`presence-web`, not `academic-web` (ADR-0009); the split is frontend-only, so these
modules stay here beside the domains they read. Three things there are load-bearing:

- **Credential validity defines a person's expected days.** `NOT_EXPECTED` has three
  distinct causes — a non-working weekday, a holiday, and a date outside the window in
  which the person held a card — and conflating them is what turns "no card yet" into
  "absent" on someone's payslip.
- **The direction is one-way**: `academic/` and `payroll/` read presence through
  `IDailyPresenceReadPort`; presence never reads back, and never imports from
  `academic/`. `presence-academic-direction.spec.ts` is the sweep that holds the line.
- **Nothing branches on a position.** Positions are master data the school edits, so a
  new one must work with no deployment — `presence-roster-independence.spec.ts` proves
  no file under `presence/` or `payroll/` can name one (FR-055, FR-056).

`payroll/` is the only place holding salary. Every permission is prefixed `payroll-`,
which is exempt from the `ADMIN` role bypass (ADR-0008) — an administrative role grants
nothing here. Rounding is per line and then summed, never the reverse; a salary
assignment is superseded rather than overwritten, which is what lets an earlier month
recalculate to its original figures; and an `APPROVED` run is terminal, corrected only
by an adjustment run.

Within a module (e.g. `academic/student/`), the established layering is:

```text
student/
├── presentation/       # controllers — thin, HTTP-only
├── use-cases/          # one class per business operation (CreateStudentUseCase, ...)
├── domain/             # entities, enums, exceptions, interfaces
│                       #   interfaces/ = the abstract repository (port + DI token)
├── infrastructure/     # persistence/ (Prisma impl + *.includes/.where/.writer),
│                       #   mappers, parsers
├── dto/                # request/ and response/ — one DTO per file
├── constants/
└── student.module.ts
```

There is no `repositories/` folder: the port lives in `domain/interfaces/` and its
Prisma implementation in `infrastructure/persistence/`, wired in the module via
`{ provide: IStudentRepository, useClass: PrismaStudentRepository }`.

Core rules from `NESTJS-RULES.md` (enforced by convention, not by lint):

- Controller → Use case → Repository → Prisma. The use case is injected with the
  abstract `IXxxRepository`, never the Prisma class; controllers and use cases
  never touch Prisma directly.
- One use case = one business responsibility; prefer several small classes
  (`CreateStudentUseCase`, `UpdateStudentUseCase`, ...) over one large `StudentService`.
  `services/` is only for stateless helpers that aren't a business operation.
- The deployment is single-school — there is no `organizationId`, and nothing in
  `academic/` filters by `schoolUnitId`. Scope every query by `deletedAt: null`
  plus the relevant period (`semesterId` / `academicYearId`), falling back to the
  active semester rather than reading across all years.
- Authorization checks permissions (`@RequirePermissions('students.create')` — module
  segment is plural), never role name strings (`user.role === 'ADMIN'`).
- No business logic in DTOs/entities/shared; no inline types or magic
  strings/constants inside use cases — put them in `types/` / `constants/`.
  Narrow projections in a signature (`Promise<{ id: string } | null>`) are fine.
- `*Dto` and `*Input` are two boundaries, not two styles: a DTO is the HTTP
  shape (class-validator + Swagger, under `dto/`), an Input is the repository
  port shape (plain interface, under `domain/interfaces/`). Never let a DTO
  reach a repository, and map DTO → Input field by field in the use case
  rather than forwarding the whole object — structural typing makes the
  pass-through compile, which is how an unwanted field silently reaches
  persistence.
- Throw NestJS HTTP exceptions (`NotFoundException`, `ConflictException`, ...);
  never a bare `throw new Error()`. Custom exceptions are optional and always
  extend a built-in — `academic/student/domain/exceptions/` is the reference.
- Domain events are not used: `@nestjs/event-emitter` isn't installed. A 1:1
  must-succeed consequence is a direct awaited call (ADR-0002).
- API responses use a consistent envelope produced by the global interceptor:
  `{ statusCode, message, data, meta? }` — there is no `success` field. Repositories
  return `{ data, total, page, limit }` and the interceptor folds it into
  `data` + `meta` (see `core/interceptors/response.interceptor.ts`).
- **Read only the fields the caller shows.** Every Prisma read that reaches a
  `Profile` uses one of the three shapes in `shared/domain/prisma-selects.ts` —
  name, display (name + avatar file), or roster (name + gender + NIK).
  `profile: true` is a defect, and so is a bare `true` on any relation. The
  domain row must be as narrow as the query: `UserRef<TProfile>` takes the
  projection as a parameter. A row that types its fields as **optional** cannot
  catch a narrowing — that is how a list narrowing once emptied four columns of
  the student spreadsheet while still compiling. See NESTJS-RULES.md.
- **The backend is written in English.** Exception and validation messages,
  Swagger summaries and descriptions, log lines, identifiers, and comments — all
  English. Indonesian belongs to the frontend, which owns presentation and can
  translate an English code or message into whatever the screen should say. This
  is also why field names are English: `passingScore`, not `kkm`.

  Three things are exempt, on one principle — text that leaves the system as the
  final thing a person reads, with no frontend in between to translate it:

  - **Rendered documents**: `report-card-pdf.template.ts` prints the rapor handed
    to a parent, and the student import/export spreadsheet's column headers are
    the contract with a file the TU already fills in.
  - **Messages delivered to a person**: password-reset email bodies, and the
    admission notification titles and bodies, which are stored and displayed
    verbatim to the applicant.
  - **Seed data** under `prisma/seeds/`: subject names, positions, and holidays
    are real school data, not interface text.

  Everything else that reads as Indonesian in `backend/src/` is a bug.

Import style: backend uses NodeNext ESM — relative imports include the `.js`
extension (e.g. `from './app.module.js'`) even though the source is `.ts`. A
feature's `index.ts` barrel is its public API, but **never import a NestJS Module
class or a cross-module DTO through a barrel** — import the `.module.js` / the DTO
file directly. A barrel also re-exports the feature's Module + use-cases, so a DTO
that imports it closes an ESM import cycle and crashes boot (`Nest cannot create the
<X>Module instance … the module at index [0] of the imports array is undefined`).
This matches the official NestJS guidance and is spelled out in `NESTJS-RULES.md`.

Prisma schema is split per domain under `backend/prisma/*.prisma` (e.g.
`student.prisma`, `academic.prisma`, `iam.prisma`, `inventory.prisma`,
`admission.prisma`) rather than one monolithic `schema.prisma`.

## Cross-cutting notes

- Node ≥ 20, pnpm ≥ 10 (`packageManager` pins pnpm 11.11.0).
- `pnpm-workspace.yaml` forces a single TypeScript version (5.8.3) across the
  workspace to avoid duplicate Vue/Pinia/Vue Router instances from mismatched peer
  resolution — don't add a per-package TypeScript override.
- `@typescript-eslint/unbound-method` is disabled in the backend's `lint:strict`
  config due to a known ESLint 10 crash (upstream bug, not a real violation); the
  same config also relaxes type-aware rules for test files and `prisma/*` scripts.

## Installed skills

This repo has project-scoped agent skills under `.agents/skills/` (tracked in
`skills-lock.json` at root and in `backend/`). They reinforce the conventions
already described above — prefer them over general knowledge when they overlap:

- **Backend architecture**: `clean-architecture`, `clean-code`,
  `domain-driven-design` (wondelai/skills), `nestjs-best-practices` (Kadajett),
  `nestjs-modular-monolith` (tech-leads-club) — these directly back the
  `presentation → use-cases → repositories → Prisma` layering and the dependency
  rule described above; consult them when adding a module or deciding which layer
  new code belongs in.
- **Prisma**: `prisma-cli`, `prisma-client-api`, `prisma-database-setup`,
  `prisma-postgres` (prisma/skills) — CLI, query, and setup reference.
- **Vue**: `vue`, `vue-best-practices`, `vue-debug-guides`,
  `vue-pinia-best-practices`, `vue-router-best-practices` — Composition API +
  `<script setup>` patterns and a large set of specific Vue 3 debugging gotchas.
- `find-skills` — meta-skill for discovering more skills.
- `backend/skills-lock.json` additionally pulls `neon` / `neon-postgres`
  (neondatabase/agent-skills). Their relevance is unconfirmed — `backend/.env.example`
  only shows a generic `postgresql://...?sslmode=require&pgbouncer=true` URL with no
  explicit Neon reference, so verify against the actual `DATABASE_URL` before
  assuming Neon-specific tooling (branching, Management API, etc.) applies.

## Agent skills

### Issue tracker

Issues live in GitHub Issues on `mhrmnvl/241-Apps` (uses `gh` CLI). See `docs/agents/issue-tracker.md`.

### Triage labels

Default mattpocock labels in use: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout: one `CONTEXT.md` at the repo root + `docs/adr/` for architectural decisions. See `docs/agents/domain.md`.

### Project constitution

`.specify/memory/constitution.md` (Spec Kit) states the five non-negotiable invariants
behind the rules in this file and in `NESTJS-RULES.md`, plus a **Compliance Baseline**
listing where the codebase currently deviates. When a rule here changes, check whether
the constitution needs the same amendment — the two are kept in sync by contract.
