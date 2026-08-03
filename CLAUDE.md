# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository overview

pnpm monorepo for the information system of MTs Persis 241 Al-Ikhlash: three Vue 3
frontends sharing code via workspace packages, plus one NestJS + Prisma backend, all
in a single workspace/git repo.

| Path | Package | Description |
|---|---|---|
| `apps/academic` | `academic-web` | SIAKAD 241 — academic info system (students, staff, curriculum, schedule, grades) |
| `apps/inventory` | `inventory-web` | SIMAS 241 — asset management (assets, circulation, approval) |
| `apps/admission` | `admission-web` | Admission app |
| `packages/ui` | `@241/ui` | shadcn-vue components + `cn()` util, shared by all apps |
| `packages/shared` | `@241/shared` | Composables, utils, types, config — cross-app |
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

> `test` is the one root script that also covers `@241/*`, because two of the four
> vitest suites live in `packages/master-data` and `packages/platform` rather than
> in an app. It deliberately excludes `backend`, which runs jest through its own
> filter. Packages with no `test` script are skipped.

Per-app (substitute `academic-web` / `inventory-web` / `admission-web`):

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
  `@/features/platform/<feature>`. Never reach into a package's internal paths.
- Code used by two or more apps → promote to `packages/*`. Code specific to one app
  (e.g. `menuConfig`, `AppSidebar`) stays in that app.
- `@241/platform` may depend on `@241/ui` and `@241/shared`, never the reverse.

Path aliases (see `apps/*/vite.config.ts` and `tsconfig.app.json`):

- `@/*` → app's own `src/*`
- `@/ui`, `@/ui/*`, `@/ui/utils` → `packages/ui/src`
- `@/shared/*` → `packages/shared/src`
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

### Tech stack

Vue 3 (Composition API, `<script setup>`) · TypeScript · Vite · Tailwind CSS v4 ·
shadcn-vue + Reka UI · Pinia · Vue Router · vee-validate + Zod · TanStack Vue Table ·
Lucide · Axios · FullCalendar.

## Backend architecture

NestJS modular monolith, Prisma ORM, PostgreSQL, RBAC + permission-based
authorization. Authoritative backend docs: `backend/docs/NESTJS-RULES.md` (coding
rules — kept in sync with the code) and `backend/docs/IAM.md` (auth/roles/permissions
design) — read these before making non-trivial backend changes. Earlier planning
artifacts (PROJECT_STRUCTURE, Backend-Structure, DATABASE_ARCHITECTURE, prismaSchemaV2,
REFACTOR, API_DOCUMENTATION, audit_iam, custom_domain, logical-erd) have been moved to
`backend/docs/_archive/` — they are historical and may be outdated; treat the code and
this file as the source of truth, not those.

Top-level domains under `backend/src/`: `core/` (infra: config, database, guards,
filters, interceptors, logger, storage, health, cache, events), `shared/` (helpers,
types, dto, validators — no business logic), `platform/` (auth, user, role,
permissions, session, audit-log, profile, school-unit, dashboard, notification,
file, settings, master-data, ...), `academic/` (student, teacher, classroom,
curriculum, subject, schedule, assessment, attendance, report-card, enrollment,
graduation, ...), `inventory/`, `admission/`. New modules are registered in
`src/app.module.ts`.

Within a module (e.g. `academic/student/`), the established layering is:

```text
student/
├── presentation/       # controllers — thin, HTTP-only
├── use-cases/          # one class per business operation (CreateStudentUseCase, ...)
├── repositories/        # Prisma access only
├── infrastructure/      # mappers, parsers, persistence details
├── domain/               # entities, enums, events, interfaces
├── dto/                  # one DTO per file, class-validator/class-transformer
├── types/
└── student.module.ts
```

Core rules from `NESTJS-RULES.md` (enforced by convention, not by lint):

- Controller → Use case/Service → Repository → Prisma. Controllers and services
  never touch Prisma directly.
- One use case/service = one business responsibility; prefer several small classes
  (`CreateStudentUseCase`, `UpdateStudentUseCase`, ...) over one large `StudentService`.
- Every query touching tenant data must be scoped by `organizationId` /
  `schoolUnitId`.
- Authorization checks permissions (`@RequirePermissions('students.create')`), never
  role name strings (`user.role === 'ADMIN'`).
- No business logic in DTOs/entities/shared; no inline types or magic
  strings/constants inside services — put them in `types/` / `constants/`.
- Use custom exceptions (e.g. `StudentNotFoundException`), never bare `throw new Error()`.
- API responses use a consistent envelope: `{ success, message, data }`, paginated
  as `{ data: [], meta: {} }` (see `core/interceptors/response.interceptor.ts`).

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
