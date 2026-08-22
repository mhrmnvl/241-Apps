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

Per-app `dev:*` scripts are in the root `package.json`. Each frontend app reads
`VITE_API_BASE_URL` from `apps/<app>/.env` (copy from `.env.example`).

### Build & quality checks — frontend (root scripts target all `*-web` packages)

> Root scripts filter by package name (`--filter '*-web'`), not by path
> (`./apps/*`). pnpm's path filter is case-sensitive against cwd casing, so on
> Windows a path filter can silently match nothing (green script that runs
> nothing) — always filter by name.

> `test` is the one root script that also covers `@241/*`, because three of the six
> vitest suites live in `packages/master-data`, `packages/platform`, and
> `packages/shared` rather than in an app. It deliberately excludes `backend`, which
> runs jest through its own filter. Packages with no `test` script are skipped
> (`@241/ui` has none).

Per-app, substitute `academic-web` / `inventory-web` / `admission-web` /
`portal-web` / `presence-web` into `pnpm --filter <pkg> <script>`. Each app has a
`validate` script chaining format:check + lint + typecheck + lint:strict + build.

### Backend (own tooling — always run through its filter, not root scripts)

The backend's scripts live in `backend/package.json` and must be invoked as
`pnpm --filter backend <script>`; its `validate` also runs its jest suite. Run a
single backend test file directly with jest, e.g.:

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

### State management

**Reference lists belong to Vue Query; everything else belongs to Pinia.** The
single `QueryClient` is created in `@241/platform`'s `reference-data` feature
rather than left to `VueQueryPlugin`'s default, because `useQueryClient()`
resolves through Vue's `inject` and the reference lists are read from services —
plain objects called imperatively. Handing the plugin a client we own means both
work: services call `fetchQuery` on it, components `useQuery` against the same
instance. Its keys are namespaced `['reference', key]` so that adopting
`useQuery` for anything else — a paginated table, a detail record — cannot
collide. Never mirror a reference list into a Pinia store.

## Backend architecture

NestJS modular monolith, Prisma ORM, PostgreSQL, RBAC + permission-based
authorization. The full conventions live in `backend/CLAUDE.md`, which loads
automatically when working under `backend/`. `backend/docs/NESTJS-RULES.md`
(coding rules) and `backend/docs/IAM.md` (auth/roles/permissions design) remain
the authoritative references — read them before non-trivial backend changes.

## Branches and deployment

`dev` is development, `main` is production, and both deploy automatically to the
one VPS the school runs — `/var/www/241-Apps-dev` on port 3001 and
`/var/www/241-Apps` on port 3000, each with its own database and its own
`JWT_SECRET`.

**Nothing reaches `main` that has not already run on `dev`.** A merge to `main`
deploys to the school within minutes, so `main` is not a place to try something.
The order is always:

```
work -> dev -> deploys to development -> verified there -> PR dev->main -> production
```

Two mechanisms hold that line, and neither is a substitute for the other:

- `.github/workflows/promotion-guard.yml` fails any pull request into `main`
  that does not come from `dev`, or whose exact commit has no successful
  `Deploy to Development` run. It asks the API rather than believing the pull
  request description.
- `.husky/pre-push` refuses a direct push to `main`.

Both are advisory in the strict sense: branch protection would make the check
blocking, and it needs GitHub Pro on a private repository, which this account
does not have. So a red check is loud and recorded, not enforced, and
`--no-verify` walks past the hook. Treat the rule as the thing that matters and
the mechanisms as reminders.

See `docs/environments.md` for what deploys where and `docs/vps-setup.md` for
what a box needs.

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
already described above — prefer them over general knowledge when they overlap.
Each skill's own description says when it applies; `skills-lock.json` lists what
is installed and from which marketplace.

One caveat: `backend/skills-lock.json` additionally pulls `neon` / `neon-postgres`
(neondatabase/agent-skills), and their relevance is unconfirmed —
`backend/.env.example` only shows a generic
`postgresql://...?sslmode=require&pgbouncer=true` URL with no explicit Neon
reference, so verify against the actual `DATABASE_URL` before assuming
Neon-specific tooling (branching, Management API, etc.) applies.

## Agent skills

### Engineering rules

`docs/agents/rules.md` is the consolidated ruleset distilled from the installed
skills — universal, backend, and frontend rules, each with an ID (`BE-06`,
`FE-24`) so it can be cited directly in review. It also carries two registers
worth reading before reaching for a skill: **Adopted decisions**, recording every
point where a skill contradicted this repo and what was adopted instead, and
**Skill errata**, listing code samples in the skills that are factually wrong and
must not be copied. It is operational, not authoritative — this file,
`NESTJS-RULES.md`, `IAM.md`, and `docs/adr/` still decide.

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
