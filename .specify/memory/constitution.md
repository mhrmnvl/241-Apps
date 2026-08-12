<!--
Sync Impact Report
==================
Version change: 1.2.0 → 1.3.0 (2026-08-12)
Bump rationale: MINOR — Principle II gains a sanctioned channel it did not name, and
the workspace grows a fifth app. Amendment (a)-(e):

  (a) Edits: Principle II (a bullet on cross-app data over HTTP), Technology Constraints
      (workspace shape: four apps → five), this report, the version footer.
  (b) Version and rationale: stated here.
  (c) Docs affected: docs/adr/0009-presence-web-fifth-app.md added in the same change;
      docs/adr/0007-presence-domain.md marked partially superseded; CLAUDE.md updated
      with the fifth app, dev:presence, and the same boundary rule.
  (d) Migration plan: none. No existing import changes and no access changes — the new
      app reaches academic over HTTP, which nothing previously did by any means.
  (e) Compliance Baseline: not re-surveyed. This amendment moves frontend features
      between apps and adds no backend code, so the 2026-08-10 survey still holds; the
      one item it named for apps/ (inventory feature granularity) is untouched.

Why this is an amendment rather than a clarification: Principle II said only that an
app must not import another app, which left the real question — what an app MAY do when
it needs data another app owns — unanswered. Read strictly, the silence forbids nothing
and permits anything, including copying the owning app's types, which is the failure the
principle exists to prevent. The new bullet names HTTP as the channel and requires a
single anti-corruption feature to hold it, so the boundary stays reviewable now that a
frontend split has made cross-app reads real for the first time.

Version 1.2.0's report follows.

Version change: 1.1.0 → 1.2.0 (2026-08-10)
Bump rationale: MINOR — Principle III's sanctioned exception is materially expanded.
`payroll-` joins `portal-` in ROLE_BYPASS_EXEMPT_PREFIXES. Amendment (a)-(e):

  (a) Edits: Principle III (exemption list + a sentence on what an exemption actually
      does), this report, the version footer.
  (b) Version and rationale: stated here.
  (c) Docs affected: docs/adr/0007-presence-domain.md and
      docs/adr/0008-narrow-admin-bypass-payroll.md added in the same change; CLAUDE.md
      updated with the two new backend domains.
  (d) Migration plan: none — the prefix is added together with the payroll module that
      uses it, so no existing access changes. No endpoint outside backend/src/payroll/
      uses a payroll-* code.
  (e) Compliance Baseline: re-surveyed 2026-08-10, at the end of feature 002 (T213),
      once the code existed. A survey written before it would have been a guess.

Why this is an amendment rather than a config tweak: without it, every ADMIN account
reads every salary in the school by virtue of holding the role, and no permission grant
can prevent it — the bypass runs before grants are consulted. The failure mode is exactly
the one ADR-0006 identified for the portal, with money instead of press releases. The
added sentence in III exists because "just don't grant the permission" is the intuitive
mitigation and it does not work; an agent or reviewer reaching for it should hit the
correction in the principle itself rather than in an ADR they may not open.

Version 1.1.0's report follows.

Version change: 1.0.0 → 1.1.0 (2026-08-07)
Bump rationale: MINOR — Principle III's sanctioned exception is materially expanded,
and two structural facts are corrected. Amendment (a)-(e) per the procedure below:

  (a) Edits: Principle III, Technology (workspace shape, domain vs module),
      Compliance Baseline item 3, this report.
  (b) Version and rationale: stated here.
  (c) Docs affected: none further. CLAUDE.md already records four apps, seven portal
      modules, and the portal domain; no divergence was introduced.
  (d) Migration plan: none needed — this describes code that already shipped.
  (e) Compliance Baseline: re-surveyed 2026-08-07 (below), unchanged by this bump.

What 1.1.0 fixes, all three found by `/speckit-analyze` re-run after feature
001-content-management-system shipped:

  - III: the principle said the sanctioned exception was "the `SUPER_ADMIN`/`ADMIN`
    bypass" flatly, while `PermissionGuard` had already narrowed it — ADMIN does not
    bypass `portal-*` (ADR-0006). The correction existed ONLY as a footnote in
    Baseline item 3, which called itself "an amendment to Principle III". A
    NON-NEGOTIABLE principle whose text the code contradicts is exactly the fiction
    Governance forbids, and the failure mode is specific: an agent reading III alone
    concludes ADMIN can publish to the school's public website. Now stated in the
    principle, with the exemption list named so adding a prefix is visibly an
    amendment rather than a config tweak.
  - Technology: "three apps" contradicted the Compliance Baseline 100 lines later,
    which recorded the fourth. Now four.
  - Technology: `portal/` added to the domains-holding-sibling-modules list; it is
    the newest and cleanest example of the target shape.

Version 1.0.0's report follows, retained because it records how the principles were
derived and which four the code overturned.

Version change: (unfilled template) → 1.0.0
Bump rationale: initial ratification. Every placeholder token replaced with concrete
governance. No prior version was ever committed, so this is a single first release
rather than a chain of amendments.

Derivation: a first draft was written from the repository's documentation, then
verified against a survey of the actual code (1455 backend .ts, 434 .vue, 662 frontend
.ts). The survey overturned four rules the docs implied but the code contradicts, and
all four are corrected in this version:

  - II: "no deep imports into a package's internals" is too broad — `@/shared/*`,
    `@/ui/*`, and `@/master-data/*` subpaths ARE the public alias surface (200 such
    imports are by design). The real boundary is a platform FEATURE barrel. The
    `@241/master-data` package / `@/master-data` alias were absent from the docs
    entirely.
  - III: "role-name string checks are forbidden" has one sanctioned exception in the
    code (the ADMIN/SUPER_ADMIN bypass inside PermissionGuard) — carved out.
  - V: "validate MUST pass for every workspace touched" is unenforceable —
    packages/{ui,shared,platform,master-data} have no `validate` script. Replaced with
    how those packages are actually gated.
  - V: the ≤300-line budget excludes generated/registry constant files
    (permission-codes.constants.ts is 1132 lines of data).
  - Technology: `admission/` was documented as a peer domain; it is one flat module
    holding 4 repository ports, 5 controllers, and 31 use cases.

External validation: the repo's own docs were NOT treated as the sole source of truth.
The principles were cross-checked against the installed `nestjs-modular-monolith`
skill, Prisma's transaction documentation, pnpm workspace guidance, and current
modular-monolith writing on data isolation. That pass produced Principle VI (data
ownership + transaction boundaries), the workspace dependency-hygiene rule, the
controller-return-type contract, the shared-kernel rule, and the recommendation to
enforce import boundaries in ESLint rather than by review alone.

One deliberate divergence from generic advice is recorded rather than silently
followed: the common "cross-module communication only via events" rule is rejected
here (Principle IV) because the events being replaced were fire-and-forget, so a
failed enrollment was logged instead of surfacing to the caller — ADR-0002. The same
sources also warn against in-process EventEmitters for production inter-module
communication, which supports that call.

Beyond the base template's five principles:
  - VI. Module Data Ownership and Transaction Boundaries — the template has five
    principles; this repository needs a sixth. Prisma is one client over one database,
    so neither table ownership nor transaction scope is enforced by any mechanism.
    Both are the boundaries a modular monolith actually dies of.
  - Adding a New App — the `-web` suffix is load-bearing (root scripts filter `*-web`),
    and aliases must be declared in two files. Added because a new app is the next
    planned work and both traps fail silently.
  - Compliance Baseline (2026-08-06) — the known deviations, so the document stays
    honest and points at work instead of asserting a compliance that does not exist.

Removed sections: none

Dependent artifacts:
  - .specify/templates/plan-template.md — Constitution Check gate and Complexity
    Tracking table resolve against this file as written; no edit needed.
  - CLAUDE.md — SYNCED in the same change, at the user's explicit request: added the
    packages/master-data row and the @/master-data alias, corrected the vitest suite
    count (three of six live in packages/, not two of four), tightened the boundary
    rule to name the feature-barrel limit, documented src/types/ as ambient-only,
    recorded admission's flat shape, and added a pointer to this constitution.
  - Deleted in the same change (14 files, ~4900 lines), verified complete against the
    code before removal: docs/fase-{1,2,3}-*.md and docs/fix-architecture-plan.md (all
    four targets measured at 0 — no repositories/ folders, no @prisma/client in
    domain/interfaces, no repos outside infrastructure/persistence, no `any` in
    backend src), docs/fix-subject-curriculum-filter.md (fix present in
    teachingAssignmentService.ts), backend/docs/_archive/* (9 superseded planning
    artifacts), and backend/docs/cleanup-teaching-assignment-fanout.md (code path gone;
    user confirmed the DB cleanup ran).

Follow-up TODOs: none blocking. The Compliance Baseline lists 6 remediation items.
-->

# 241-Apps Constitution

## Core Principles

### I. Layered Dependency Flow (NON-NEGOTIABLE)

Dependencies point one way, from the outside in. No layer may reach past its neighbour.

- Backend: Controller → Use Case → Repository port → Prisma. Controllers MUST be
  HTTP-only (parse, delegate, return); they MUST NOT contain business logic or touch
  Prisma. Use cases MUST be injected with the abstract `IXxxRepository` token, never a
  concrete Prisma class, and MUST NOT import `PrismaService`.
- Only `infrastructure/persistence/` may import Prisma. The port lives in
  `domain/interfaces/`; the module wires them with
  `{ provide: IXxxRepository, useClass: PrismaXxxRepository }`.
- One use case = one business operation. Several small classes
  (`CreateStudentUseCase`, `UpdateStudentUseCase`) are REQUIRED over one large
  `XxxService`. `services/` is reserved for stateless helpers that are not a business
  operation.
- Frontend: within a feature, `api/` performs HTTP calls only, `services/` holds
  business logic, `stores/` holds Pinia state. Where a feature has a `services/` layer,
  `components/` and `views/` MUST go through it (or through a store/composable) rather
  than calling `api/` directly. A feature with real business logic MUST have one.

Rationale: this is what makes a feature removable and a domain independently
evolvable. Every shortcut across a layer trades a few minutes now for a module that
can no longer be tested, replaced, or extracted later.

### II. Domain Boundaries and One Source of Truth

One domain = one feature, and every feature is consumed only through its public API.

- The public alias surface is exactly: `@/ui`, `@/ui/*`, `@/ui/utils`, `@/shared`,
  `@/shared/*`, `@/master-data`, `@/master-data/*`, and
  `@/features/platform/<feature>`. Subpath imports under `@/shared/*`, `@/ui/*`, and
  `@/master-data/*` are part of that surface and are permitted.
- A platform feature's barrel is the boundary: importing
  `@/features/platform/<feature>/stores/...`, `/services/...`, or `/api/...` is
  forbidden. Import the symbol from `@/features/platform/<feature>` instead.
- Backend cross-domain access goes through a module's public API only.
  `platform/` is a supplier to everyone; `academic/`, `inventory/`, and `admission/`
  MAY consume `platform/` but MUST NOT reach into each other's internals.
  `@241/platform` MAY depend on `@241/ui`, `@241/shared`, and `@241/master-data`;
  never the reverse.
- Barrel exception (backend, NodeNext ESM): a NestJS Module class or a cross-module
  DTO MUST be imported from its own `.module.js` / DTO file, never through a barrel.
  A DTO importing a barrel closes an ESM cycle and crashes boot.
- Every backend module that owns a port or a response DTO, and every frontend feature,
  MUST expose an `index.ts` barrel exporting exactly those. Two kinds of directory are
  deliberately excluded, because a barrel there would have nothing legal to export:
  grouping directories with no `*.module.ts` of their own (`academic/master-data`,
  `platform/master-data`, `platform/access-control`, `features/academic/`,
  `features/academic/shared/`), and aggregator modules whose module class only
  re-exports sibling modules (`inventory/master-data`). In both cases the only
  available export is a Module class, which the ESM-cycle rule above forbids.
- An app MUST NOT import from another app, by alias or by relative path. Apps are
  siblings, never dependencies.
- Where an app needs data another app owns, **HTTP is the only channel**. It calls the
  backend endpoint directly and declares its own narrow read model naming just the
  fields it uses — never a type imported or copied from the owning app, whose payloads
  are free to grow. That read model and its calls MUST be confined to one feature
  acting as the anti-corruption layer; `presence-web`'s `features/lookup` is the
  reference (ADR-0009). This is not a loophole in the rule above: nothing is imported,
  and the dependency is on a published API rather than on another app's source.
- Code used by two or more apps MUST be promoted to `packages/*`. Code specific to one
  app (`menuConfig`, `AppSidebar`) stays in that app. Copying shared code between apps
  is forbidden.
- A shared package is a kernel, not a dumping ground. Backend `shared/` holds helpers,
  types, enums, constants, and utils — never business logic. `@241/shared` carries no
  UI dependency; anything needing a Vue SFC belongs in `@241/ui` or `@241/master-data`
  (ADR-0001). When a shared helper starts encoding a domain rule, it belongs in that
  domain's module instead.

Rationale: the monorepo exists because duplicated `shared/`, `ui/`, and `platform/`
code drifted silently — a bug fixed in one app stayed alive in the other. Boundaries
enforced at import time are the only ones that hold.

### III. Scoped and Authorized Data Access (NON-NEGOTIABLE)

Every query is scoped and every action is permission-controlled.

- Every academic query MUST filter `deletedAt: null`. A `findMany()` without it
  silently returns deleted students, classes, and scores.
- Every row that belongs to a period MUST be scoped by `semesterId` or
  `academicYearId`. When the caller supplies neither, the active semester MUST be
  resolved rather than reading across all years. Unbounded list reads that ignore the
  active period are forbidden.
- The deployment is single-school: there is no `organizationId`, and nothing in
  `academic/` filters by `schoolUnitId`. Tenant filters the schema cannot honour MUST
  NOT be added.
- Authorization MUST use permissions (`@RequirePermissions('students.create')`, module
  segment plural). Role-name and role-code string comparisons are forbidden in
  controllers, use cases, and repositories. The single sanctioned exception is the
  role bypass inside `PermissionGuard` itself — the guard is where role-to-permission
  resolution belongs, and that check MUST NOT be copied elsewhere. The bypass is not
  uniform: `SUPER_ADMIN` passes every permission as break-glass, while `ADMIN` passes
  every permission **except** those whose module segment is listed in
  `ROLE_BYPASS_EXEMPT_PREFIXES` (currently `portal-` and `payroll-`). An exempt prefix
  means a boundary the top operational role does not walk through by virtue of its role
  (ADR-0006 for `portal-`, ADR-0008 for `payroll-`); adding one is an amendment to this
  principle, not a configuration change. Note what an exemption does and does not do: it
  removes the free pass, so the permission must be granted explicitly. It is therefore
  the only mechanism that makes a grant meaningful at all — "simply do not grant it" is
  no protection against a bypass that runs before grants are read.

Rationale: wrong data in a school record looks exactly like correct data to the user
reading it. Scoping and permission failures are silent by nature, so they must be
structural, not remembered per query.

### IV. Explicit Contracts at Every Boundary

Each boundary has its own shape, and crossing one means mapping, not forwarding.

- `*Dto` is the HTTP shape (class-validator + Swagger, under `dto/`). `*Input` is the
  repository port shape (plain interface, under `domain/interfaces/`). A DTO MUST NOT
  reach a repository.
- Use cases MUST map DTO → Input field by field. Forwarding a whole object is
  forbidden: structural typing makes the pass-through compile, which is how an
  unwanted field silently reaches persistence.
- API responses MUST use the global envelope `{ statusCode, message, data, meta? }`.
  There is no `success` field. Repositories return `{ data, total, page, limit }` and
  the interceptor folds it into `data` + `meta`.
- No `any`, no magic strings or numbers, no inline types inside use cases — types go
  in `types/`, constants in `constants/`. Narrow projections in a signature
  (`Promise<{ id: string } | null>`) are acceptable. Backend `src/` is currently free
  of `any` outside specs; that is the standard to hold, not an aspiration.
- Errors MUST be NestJS HTTP exceptions (`NotFoundException`, `ConflictException`).
  `throw new Error()` is forbidden; custom exceptions MUST extend a built-in.
- Domain events are not used (`@nestjs/event-emitter` is not installed). A 1:1
  must-succeed consequence MUST be a direct awaited call (ADR-0002). This is a
  deliberate divergence from the generic "cross-module communication happens only via
  events" advice: an in-process `EventEmitter` is fire-and-forget, so a failed
  consequence was being logged instead of reaching the caller. Decoupling that hides a
  failed enrollment is not decoupling. Revisit only if a real broker (not an in-process
  emitter) is introduced, and record it as an ADR superseding ADR-0002.
- A controller's declared return type is the real contract: every list endpoint returns
  `PaginatedResponse<T>`, every detail endpoint an explicit entity or response DTO.
  Never `any`, never an inline object literal. The row shape is pinned at the query in
  a `*.includes.ts` file; add a mapper under `infrastructure/mappers/` only when the
  outward shape genuinely differs (renamed, computed, or flattened fields).

Rationale: an implicit contract fails at runtime, in production, on a record someone
depends on. Every rule here converts a silent failure mode into a compile error or an
HTTP status.

### V. Green Quality Gates

A change is finished when the gates are green — not when it works locally.

- Apps and backend expose `validate` and MUST pass it before merge: frontend
  `format:check + lint + typecheck + lint:strict + build`, backend additionally
  `test`. `packages/*` have no `validate` script — they are gated transitively,
  because apps consume them as raw TypeScript source, so `pnpm typecheck` and
  `pnpm build` cover them. `packages/{shared,platform,master-data}` additionally run
  under the root `pnpm test`. A change touching a package MUST run those root scripts.
- Root scripts MUST be filtered by package name (`--filter "*-web"`), never by path.
  pnpm's path filter is case-sensitive against cwd casing, so on Windows it can match
  nothing and report a green run that executed no checks.
- New backend use cases MUST ship with a `*.spec.ts`. This is the codebase's
  established practice (243 backend specs today), not a new demand. Frontend test
  coverage is thin by comparison and is expected to grow with new shared logic in
  `packages/*` rather than retroactively across existing views.
- File budgets, counting code (imports, `@Api*` Swagger decorators, and pure
  data/registry constant files excluded): use case / service ≤ 300 lines, repository
  class ≤ 200, controller ≤ 150, any other file ≤ 300. An over-budget repository MUST
  be split into sibling `*.includes.ts`, `*.where.ts`, `*.writer.ts` files, leaving the
  class a flat contract → call map. The interface MUST NOT be split.
- Lint and type errors MUST be fixed, not suppressed. A disabled rule REQUIRES a
  comment naming the upstream cause; the single standing exception is
  `@typescript-eslint/unbound-method` in the backend `lint:strict` config (ESLint 10
  crash, upstream bug).
- **Comments are short.** One line is the norm, two the maximum, three only when the
  reasoning is genuinely load-bearing (a non-obvious constraint, a rejected
  alternative, an upstream bug). Explain WHY, never restate what the code already
  says. A comment longer than the code it introduces means the code needs a better
  name or a smaller function, not more prose. Existing long comment blocks are not a
  licence to add more.
- Clean code over clever code.

Rationale: gates that are optional are gates that are skipped under deadline. The
budgets are early warnings — a file exceeding them has usually absorbed a second
responsibility. Comment discipline is the same instinct applied to prose: an
explanation that keeps growing is describing a design problem.

### VI. Module Data Ownership and Transaction Boundaries

A module owns its tables. Prisma is one client over one database, so nothing mechanical
stops a repository from reading another module's rows — which is precisely why this
must be a stated rule.

- A repository MUST query only the models its own module owns. Reading another
  module's data goes through that module's injected port (e.g. `IStudentRepository`),
  never `this.prisma.<theirModel>`. The single-client convenience is what quietly turns
  a modular monolith back into a big ball of mud.
- Use a Prisma transaction when several writes inside ONE module must land together:
  promotion / semester rollover, account provisioning (User + Profile + Student),
  bulk score or attendance import, soft-deleting a student together with its user
  account.
- A write sequence that crosses a module boundary MUST NOT be wrapped in a shared
  transaction (ADR-0003). Immediate consistency belongs inside an aggregate; between
  aggregates it is eventual. A transaction spanning two modules means a failure in one
  rolls back the other, and the boundary stops being a boundary.
- Reach for a transaction because the writes are same-module AND not safe to retry —
  never because "multiple writes" pattern-matches a database habit. Steps that are
  idempotent and whose failure already surfaces to the caller do not need one.
- Prefer the batch form `prisma.$transaction([...])` when the writes do not depend on
  each other; reserve the interactive form for genuine read-then-decide-then-write
  sequences. Interactive transactions MUST stay short and MUST NOT contain network
  calls, file/storage I/O, or slow queries — Prisma's own guidance, and the reason
  ADR-0003 refused to thread one through a cross-module chain.
- **Auditing is not enforced.** `AuditLog` and `platform/audit-log/` exist as
  infrastructure, but nothing in `academic/` writes an audit row. Do not describe this
  system as audited. When it is wired up, grade changes and report-card publishes come
  first — those are the records a school is actually asked to account for.

Rationale: Principle I's layering is enforced by types, but data ownership is not.
Prisma will happily join across every domain in the schema, and a transaction will
happily span two modules. Both boundaries survive only because they are written down
and reviewed.

## Technology and Structure Constraints

- **Toolchain**: Node ≥ 20, pnpm ≥ 10 (`packageManager` pins 11.11.0). TypeScript is
  pinned workspace-wide at 5.8.3 via `pnpm-workspace.yaml`. Per-package TypeScript
  overrides are forbidden — mismatched peer resolution produces duplicate Vue, Pinia,
  and Vue Router instances.
- **Workspace dependency hygiene**: a package MUST declare every `@241/*` it imports in
  its own `package.json` using `workspace:*`. Vue, Pinia, and Vue Router MUST be
  declared as `peerDependencies` in `packages/*`, never as `dependencies` — putting
  them in `dependencies` gives the package its own copy and reintroduces the duplicate
  runtime instance (Pinia's "reading `_s` of undefined") that the TypeScript pin exists
  to prevent. pnpm's strict `node_modules` will not cover an undeclared import.
- **Workspace shape**: five apps (`academic`, `inventory`, `admission`, `portal`,
  `presence`), four packages (`@241/ui`, `@241/shared`, `@241/platform`,
  `@241/master-data`), one `backend`.
- **Frontend stack**: Vue 3 (Composition API, `<script setup>`), TypeScript, Vite,
  Tailwind CSS v4, shadcn-vue + Reka UI, Pinia, Vue Router, vee-validate + Zod,
  TanStack Vue Table, Lucide, Axios, FullCalendar. Adding a cross-cutting dependency
  REQUIRES justification in the feature plan.
- **No build step between packages and apps**: `packages/*` are consumed directly as
  TypeScript source through path aliases. Do not introduce a publish or build step.
- **shadcn-vue components** live in `packages/ui` and MUST be added through its CLI and
  `components.json`, not copied into an app.
- **Reference-data CRUD** MUST go through `@241/master-data` with a per-entity
  `config.ts` implementing `MasterDataConfig<T>` (ADR-0001). Do not rebuild the
  ListView/FormDialog/columns shape by hand for a new lookup entity.
- **Backend stack**: NestJS + Prisma + PostgreSQL, NodeNext ESM — relative imports
  carry the `.js` extension even though the source is `.ts`.
- **Backend module layout**: `presentation/`, `use-cases/`, `domain/` (entities, enums,
  exceptions, interfaces), `infrastructure/` (persistence, mappers, parsers), `dto/`
  (`request/`, `response/`), `constants/`, `<name>.module.ts`, `index.ts`. There is no
  `repositories/` folder. New modules are registered in `src/app.module.ts`.
- **Domain vs module**: `platform/`, `academic/`, `inventory/`, and `portal/` are domains
  holding sibling modules, and that is the target shape for every domain. `admission/` is a
  single flat module at domain level that has already outgrown it — see the Compliance
  Baseline. New admission work MUST NOT extend the flat layout.
- **Prisma schema** is split per domain under `backend/prisma/*.prisma`. A new model
  goes in its domain's file; a single monolithic `schema.prisma` MUST NOT be
  reintroduced.
- **Authoritative documentation**: root `CLAUDE.md`, `backend/docs/NESTJS-RULES.md`,
  `backend/docs/IAM.md`, `CONTEXT.md`, `docs/adr/*`, and `docs/agents/*`. That list is
  exhaustive by design. A doc whose work is finished MUST be deleted, not archived —
  git history is the archive, and a stale doc that contradicts the code misleads every
  agent that reads it. Durable knowledge belongs in an ADR or in `CLAUDE.md`; a
  finished migration plan or remediation runbook belongs in the past.

## Adding a New App

A new app joins an existing workspace; it is never scaffolded in isolation. Adding one
is an architectural decision and REQUIRES an ADR.

1. **The package name MUST end in `-web`.** Root scripts filter on `*-web`, so an app
   named otherwise is silently excluded from `build`, `typecheck`, `lint`,
   `lint:strict`, `test`, and `format:check` — every script stays green while never
   touching it. This is the most expensive mistake available in this repository, and it
   produces no error message.
2. **Scripts MUST mirror an existing app.** `apps/admission/package.json` is the
   reference; `validate` in particular MUST be present and MUST chain
   `format:check → lint → typecheck → lint:strict → build`.
3. **Aliases MUST be declared in two places** — `vite.config.ts` for runtime resolution
   and `tsconfig.app.json` for type resolution. Declaring one without the other yields
   a build that resolves but fails typecheck, or the reverse. The full set is `@/*`,
   `@/ui`, `@/ui/*`, `@/ui/utils`, `@/shared/*`, `@/master-data`, `@/master-data/*`,
   `@/features/platform/*`.
4. **Branding goes through `configureAuth()`** in `src/app/main.ts`. The `auth` feature
   in `@241/platform` is brand-neutral by contract; forking or copying it is forbidden.
5. **Reuse before writing.** Anything already in `@241/ui`, `@241/shared`,
   `@241/master-data`, or `@241/platform` MUST be consumed as-is. Reference-data CRUD
   goes through `@241/master-data` with a per-entity `config.ts` (ADR-0001). Code that
   turns out to be useful to a second app MUST be promoted to `packages/*`, never
   copied.
6. **Feature layout from day one**: `src/features/<domain>/` with one domain per
   feature, the internal layout from Principle I, and an `index.ts` barrel.
   `apps/academic` is the reference. `apps/inventory` is NOT — see Compliance
   Baseline item 4.
7. **Backend side**: the app's domain gets its own top-level domain under
   `backend/src/` holding sibling modules (never one flat module — Baseline item 6),
   registered in `src/app.module.ts`, with permissions defined up front per
   Principle III.

## Development Workflow and Review Process

- **Feature flow**: `/speckit-specify` → `/speckit-plan` → `/speckit-tasks` →
  `/speckit-implement`. The plan's Constitution Check gate MUST be evaluated before
  Phase 0 research and re-checked after Phase 1 design.
- **Architectural decisions** — a new package, a new module edge, abandoning an
  established pattern — MUST be recorded as a numbered ADR in `docs/adr/` with
  Context, Decision, Considered Options, and Consequences. ADR-0001 through ADR-0004
  are the reference format. Changes to shared domain vocabulary go in `CONTEXT.md`.
- **Issue tracking**: GitHub Issues on `mhrmnvl/241-Apps` via the `gh` CLI, using the
  triage labels in `docs/agents/triage-labels.md`.
- **Commits**: work happens on a branch and merges to `main` by PR. Husky +
  lint-staged run on staged files; backend paths use the backend ESLint config.
  Hooks MUST NOT be bypassed (`--no-verify`) — a failing hook is fixed at its cause.
- **Review**: every PR review MUST verify compliance with these principles. A
  deliberate violation MUST be recorded in the plan's Complexity Tracking table with
  the specific need and why the simpler alternative was rejected; an unrecorded
  violation blocks merge.
- **Automate what review cannot hold.** Boundary rules currently rest on review alone,
  and good intentions erode under deadline. The import boundaries in Principle II
  (feature-barrel imports, no app→app, package dependency direction) SHOULD be moved
  into an ESLint `no-restricted-imports` rule so a violation fails `pnpm lint` instead
  of depending on a reviewer noticing. Until that exists, treat these as the rules most
  likely to drift.
- **Documentation parity**: when a change alters a rule stated in `CLAUDE.md` or
  `NESTJS-RULES.md`, the doc MUST be updated in the same change. Those files are kept
  in sync with the code by contract, and agents rely on them as current.

## Compliance Baseline (re-surveyed 2026-08-10)

The codebase largely holds these principles: no `repositories/` folders, no `any` in
backend `src/`, no cross-app imports, no package→app reverse dependency, every
controller and use case within budget, and the `*.includes.ts` / `*.where.ts` split
pattern adopted across 43 files.

**Re-surveyed after feature `001-content-management-system`**, which added a fourth
app (`apps/portal`, package `portal-web`) and a seventh backend domain
(`backend/src/portal/`, seven sibling modules). Findings:

- The new domain adds **no items to this list**. All seven of its Prisma repositories
  are under 200 lines, every module exposes an `index.ts`, no DTO imports a barrel,
  and `portal/` reaches `academic/`, `inventory/`, and `admission/` not at all —
  asserted by `src/portal/portal-siakad-disjointness.spec.ts` rather than by review.
- Two deliberate deviations were introduced and are recorded as ADRs rather than as
  debt, because both are decisions rather than shortcuts: **ADR-0005** (a fourth app)
  and **ADR-0006** (narrowing the `ADMIN` permission bypass at `portal-*`, which
  amends the single sanctioned exception named in Principle III).
- One new sanctioned global: `PortalSharedModule` and `PortalFileUsageModule` are
  `@Global()`. Both are justified in their own docblocks — the first carries the
  public response cache that every portal module reaches for, the second registers
  the portal's implementation of a `platform/file` port so file deletion can be vetoed
  without `platform/` learning anything about the portal (dependency inversion, not a
  boundary violation).

**Re-surveyed after feature `002-qr-attendance-payroll`**, which added two backend
domains (`backend/src/presence/`, eight sibling modules; `backend/src/payroll/`, five)
and 21 features to `apps/academic`. Findings:

- The two new domains add **no items to the debt list below**. Every Prisma repository
  is under 200 lines — four were over during implementation and were split with the
  sanctioned `*.includes.ts` / `*.writer.ts` / sibling-function pattern rather than
  left as debt — every controller is under 150, and no file under either domain
  contains `any`.
- Three structural claims are asserted by tests rather than by review:
  `presence-roster-independence.spec.ts` (nothing branches on a position — FR-055,
  FR-056), `presence-academic-direction.spec.ts` (presence never imports `academic/`),
  and `test/payroll-authorization.e2e-spec.ts` (every payroll route refuses an `ADMIN`
  with no explicit grant — the ADR-0008 regression net).
- One deliberate deviation, recorded as an ADR rather than as debt: **ADR-0008**
  (extending Principle III's bypass exemption to `payroll-*`). **ADR-0007** records the
  new `presence/` domain and the one-way `academic → presence` edge.
- One deviation from the tasks as written, recorded here because it is a pattern rather
  than a one-off: `@241/master-data` expresses only text and boolean fields, so any
  entity needing a select builds a bespoke dialog. `academic/position` set that
  precedent; `leave-type` and `payroll/component` follow it. The task list called for a
  master-data `config.ts` for salary components, and that was not possible.

The deviations below were found by survey and are recorded as debt. They are NOT
precedent: new code MUST NOT extend them, and a change touching one of these files
SHOULD fix it in passing.

1. **Repository budget (Principle V)** — six Prisma repositories exceed 200 lines:
   `admission` application (486) and applicant (408), `inventory/circulation` (323),
   `inventory/approval` (300), `platform/dashboard` (249), `inventory/asset` (201).
   Remediate by extracting `*.includes.ts` / `*.where.ts` / `*.writer.ts`.
2. **`apps/inventory` feature granularity (Principles I, II)** —
   `features/inventory/` is one flat feature (`api`, `components`, `views`, `types`)
   with no `services/`, no `stores/`, and no barrel, while the backend splits the same
   domain into `asset`, `circulation`, and `approval` modules. 14 view/component files
   call `api/` directly as a result. Splitting it to match the backend is the target
   shape; `apps/academic` (37 features, 33 with `services/`) is the reference.
3. **The `ADMIN` permission bypass is now narrowed (Principle III)** — the guard's
   blanket bypass no longer covers permissions whose module segment begins `portal-`;
   `SUPER_ADMIN` retains it as break-glass. `iam.seed.ts` matches, granting `ADMIN`
   every permission *except* the portal's — a bypass removed and then handed back as
   an explicit grant would be no boundary at all. Recorded in full as ADR-0006, and
   now stated directly in Principle III — this entry is history, not a correction
   living outside the principle it corrects.
4. **Admission provisions accounts by writing other domains' tables
   (Principle VI)** — `enrollAsStudent` in `prisma-admission-application.repository.ts`
   opens one `$transaction` and writes `tx.student`, `tx.studentEnrollment`,
   `tx.studentParent`, `tx.parent`, and `tx.semester` (owned by `academic/`) plus
   `tx.profile`, `tx.userRole`, `tx.address`, and `tx.file` (owned by `platform/`).
   Two reads, `isNisTaken` / `isNisnTaken`, hit `prisma.student` the same way even
   though `IStudentRepository` already exposes `findByNis` / `findByNisn`.

   This remains the sharpest open tension in the codebase and MUST NOT be fixed by
   reflex:
   routing the writes through the owning modules removes the shared transaction that
   currently makes provisioning atomic, and Principle VI forbids spanning a transaction
   across modules. Resolving it REQUIRES an ADR that picks one of — a saga/compensating
   sequence over idempotent steps, an `academic`-owned provisioning use case that takes
   the whole applicant payload, or an explicit, documented exemption for provisioning.
   Do not extend the current pattern in the meantime.
5. **`backend/src/admission` is a flat module (Technology: domain vs module)** — it
   holds four repository ports (wave, announcement, applicant, application), five
   controllers, and 31 use cases in one module, so the "split on the second bounded
   concern" trigger passed long ago. The four ports and five controllers already mark
   the seams; splitting into sibling `wave/`, `announcement/`, `applicant/`, and
   `application/` modules also resolves item 1's two oversized repositories and gives
   item 4 a natural home.

This section MUST be re-surveyed and updated whenever the constitution is amended. An
item that is fixed is deleted from the list, not marked done.

## Governance

This constitution supersedes ad-hoc practice, habit, and precedent found in existing
code. `backend/docs/NESTJS-RULES.md` remains the detailed backend rulebook; this file
states the invariants behind it. If the two conflict, the conflict MUST be resolved by
amending one of them in the same PR — silent divergence is not an option.

**Amendment procedure**: an amendment is a PR that (a) edits this file, (b) states the
new version and the bump rationale, (c) lists every doc or template affected,
(d) includes a migration plan when the change invalidates existing code, and (e)
re-surveys the Compliance Baseline.

**Versioning policy** — semantic versioning of governance:

- **MAJOR**: a principle is removed or redefined in a backward-incompatible way.
- **MINOR**: a principle or section is added, or guidance is materially expanded.
- **PATCH**: clarification, wording, or typo fixes with no change in meaning.

**Compliance review**: constitution compliance is verified at PR review, and complexity
that violates a principle MUST be justified in the plan's Complexity Tracking table.
Repeated exceptions to the same rule are evidence the rule is wrong — amend it rather
than accumulating exemptions. A rule that the codebase contradicts is either fixed in
the code or corrected here; it is never left standing as fiction.

**Runtime development guidance**: root `CLAUDE.md` for the workspace,
`backend/docs/NESTJS-RULES.md` for backend work.

**Version**: 1.3.0 | **Ratified**: 2026-08-06 | **Last Amended**: 2026-08-12
