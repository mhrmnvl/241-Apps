# Implementation Plan: School Portal & Content Management System

**Branch**: `001-content-management-system` | **Date**: 2026-08-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-content-management-system/spec.md`

## Summary

Add a fourth frontend application — `portal-web`, the school's public website — and a new
backend domain `portal/` that owns its content. The portal serves anonymous visitors
(homepage, Berita, Artikel, Pengumuman, Agenda, Galeri, Halaman) and hosts its own
management area for the staff who run it, whose permissions are disjoint from SIAKAD's.

Three decisions shape the whole design and are argued in [research.md](./research.md):

1. **Public visibility is a read-time predicate, not a stored flag.** An item is public
   when `deletedAt IS NULL AND status IN (SCHEDULED, PUBLISHED) AND publishedAt <= now()`.
   Scheduled publishing, announcement expiry, and agenda upcoming/past all fall out of
   this. A one-minute cron only normalizes the stored `status` label for the admin list —
   correctness never depends on it running.
2. **Media becomes public by being referenced, not by being flagged.** The bucket is
   private and served by expiring signed URLs, which a public website cannot use. A
   `PortalMediaUsage` table records every reference; a stable public endpoint redirects to
   a freshly-minted signed URL, but only for files referenced by currently-published
   content. Unpublishing an item revokes its images with no extra step.
3. **Link previews need HTML that crawlers can read.** WhatsApp and Facebook do not run
   JavaScript, so a client-rendered SPA cannot satisfy FR-065 on its own. NestJS therefore
   serves the portal's built `index.html` and injects the per-path metadata itself before
   responding — the logic sits next to its data and is unit-testable, rather than living in
   a proxy config no test exercises. A 1200×630 JPEG preview variant goes with it, because
   preview crawlers drop images that are too large.

## Technical Context

**Language/Version**: TypeScript 5.8.3 (pinned workspace-wide). Node ≥ 20.

**Primary Dependencies**: Backend — NestJS, Prisma, `@nestjs/schedule` (installed,
`@Cron` precedent in `auth-cleanup.service.ts`), `@nestjs/throttler`, `sharp` (installed),
`@aws-sdk/client-s3`. Frontend — Vue 3 `<script setup>`, Vite, Tailwind v4, shadcn-vue +
Reka UI, Pinia, Vue Router, vee-validate + Zod, Axios.

**New dependencies**: `sanitize-html` + `@types/sanitize-html` and `@nestjs/serve-static` on
the backend (research R6 and R3); `@tiptap/vue-3` + `@tiptap/starter-kit` +
`@tiptap/extension-image` + `@tiptap/extension-link` in `apps/portal` only.

**Storage**: PostgreSQL via Prisma; new per-domain schema file `backend/prisma/portal.prisma`.
Media in the existing private S3/MinIO bucket through `StorageService`.

**Testing**: Backend jest — one `*.spec.ts` per new use case (constitution V). Frontend
vitest in `apps/portal`, covering the visibility predicate, slug behaviour, and router
public/admin split.

**Target Platform**: Web. Portal dev server on port 5176 (academic 5173, admission 5175).

**Project Type**: pnpm monorepo — new frontend app + new backend domain.

**Performance Goals**: Public content page paints main text within 2.5s on 4G (SC-007);
homepage in one round trip; 50-photo album usable within 3s (SC-015).

**Constraints**: Public endpoints anonymous and throttled (FR-027). Portal readable while
SIAKAD is in maintenance (FR-003) — satisfied structurally, since maintenance mode is a
per-`AppKey` setting and the portal gets its own key. Media URLs must survive being
cached by a third party (FR-065).

**Scale/Scope**: 1,000 published items, 200 albums, 10,000 monthly visitors (SC-012).
11 user stories, 68 functional requirements, 6 new backend modules, ~6 frontend features.

## Constitution Check

*GATE: evaluated before Phase 0, re-checked after Phase 1 design.*

| # | Principle | Verdict | How this design satisfies it |
|---|---|---|---|
| I | Layered Dependency Flow | **PASS** | Every module uses `presentation/ → use-cases/ → domain/interfaces/ → infrastructure/persistence/`. One use case per operation. Frontend features get a real `services/` layer; views never call `api/` directly. |
| II | Domain Boundaries | **PASS** | `portal/` is a new top-level backend domain of sibling modules, each with an `index.ts` barrel. Portal consumes `platform/` (file, auth, user) as a supplier and never reaches into `academic/`. Frontend imports only through the public aliases; no app→app import. |
| III | Scoped and Authorized Data Access | **PASS with note** | Every query filters `deletedAt: null`. Portal content is **not** period-scoped — it has no `semesterId`/`academicYearId`, which is correct: a news article does not belong to a semester. The period-scoping rule targets academic rows and does not apply here. Authorization is permission-based (`portal-posts.publish`, …), never role strings. See the FR-062 entry in Complexity Tracking. |
| IV | Explicit Contracts | **PASS** | DTO (HTTP) and Input (port) are separate; use cases map field by field. Global response envelope; list endpoints return `PaginatedResponse<T>`. NestJS HTTP exceptions only. No domain events — the cron is a scheduled job, not an event bus. |
| V | Green Quality Gates | **PASS** | `portal-web` ships the full `validate` chain. Every new use case gets a `*.spec.ts`. Repositories stay under 200 lines via `*.includes.ts` / `*.where.ts` / `*.writer.ts` — the visibility predicate lives in `post.where.ts` and is shared, not retyped. |
| VI | Module Data Ownership | **PASS** | Each portal module queries only its own models. The homepage aggregator injects the four sibling repository ports rather than touching their tables. `portal/media` reads `platform/file` through `IFileRepository`. No transaction spans a module boundary. |

**Adding a New App** (constitution section) — all seven items addressed:

1. Package name `portal-web` ✓ (ends in `-web`, so root `--filter "*-web"` scripts pick it up).
2. Scripts mirror `apps/admission/package.json` including the full `validate` chain.
3. Aliases declared in **both** `vite.config.ts` and `tsconfig.app.json`.
4. Branding through `configureAuth()` in `src/app/main.ts` — the `auth` feature is not forked.
5. Reuse before writing: categories and tags go through `@241/master-data` with a per-entity
   `config.ts` (ADR-0001); tables, dialogs, and form controls come from `@241/ui`.
6. Feature-per-domain layout with `index.ts` barrels from day one; `apps/academic` is the reference.
7. Backend gets its own top-level domain `backend/src/portal/` holding sibling modules —
   explicitly *not* one flat module (the mistake `admission/` is now paying for).

**ADRs required by this feature** (two, both drafted in Phase 1):

- **ADR-0005 — `portal-web` as a fourth application.** Why the portal is not a route tree
  inside `apps/admission`: different audience, different operators, different availability
  requirement, and a public marketing surface has no business sharing a bundle with an
  application that handles applicant personal data.
- **ADR-0006 — narrowing the `ADMIN` permission bypass.** See Complexity Tracking.

**Gate result: PASS.** One deliberate deviation, recorded below.

## Project Structure

### Documentation (this feature)

```text
specs/001-content-management-system/
├── plan.md              # This file
├── research.md          # Phase 0 output — 9 decisions with rationale
├── data-model.md        # Phase 1 output — 12 models, states, indexes
├── quickstart.md        # Phase 1 output — runnable validation scenarios
├── contracts/
│   ├── portal-public-api.md    # Anonymous endpoints
│   ├── portal-admin-api.md     # Guarded endpoints
│   └── permissions.md          # New permission catalogue entries
├── checklists/
│   └── requirements.md  # Spec quality checklist (complete)
└── tasks.md             # Phase 2 output — NOT created by /speckit-plan
```

### Source Code (repository root)

```text
backend/
├── prisma/
│   └── portal.prisma                   # NEW — all portal models
└── src/
    ├── portal/                         # NEW top-level domain
    │   ├── portal.module.ts
    │   ├── post/                       # Berita | Artikel | Pengumuman
    │   │   ├── presentation/           # post.controller.ts + post-public.controller.ts
    │   │   ├── use-cases/              # create/update/publish/unpublish/archive/delete/restore/get*
    │   │   ├── domain/                 # entities, enums, interfaces (IPostRepository)
    │   │   ├── infrastructure/persistence/  # prisma-post.repository.ts + .includes/.where/.writer
    │   │   ├── dto/{request,response}/
    │   │   ├── constants/
    │   │   ├── services/               # slug-builder, html-sanitizer (stateless helpers)
    │   │   ├── post.module.ts
    │   │   └── index.ts
    │   ├── agenda/                     # same layout
    │   ├── gallery/                    # albums + ordered photos
    │   ├── page/                       # Halaman + public navigation
    │   ├── taxonomy/                   # categories + tags
    │   ├── media/                      # PortalMediaUsage + public media endpoint
    │   └── homepage/                   # section config + cross-module aggregation
    ├── platform/access-control/permission/
    │   ├── constants/permission-codes.constants.ts   # + portal-* entries
    │   └── guards/permission.guard.ts                # + bypass exemption (ADR-0006)
    ├── shared/domain/enums/app-key.enum.ts           # + PORTAL
    └── app.module.ts                                 # + PortalModule

apps/portal/                            # NEW app, package name "portal-web"
├── package.json                        # mirrors apps/admission
├── vite.config.ts                      # port 5176 + full alias set
├── tsconfig.app.json                   # same aliases, second declaration
└── src/
    ├── app/
    │   ├── main.ts                     # configureAuth({ appTitle: 'Portal 241', ... })
    │   └── providers/router/index.ts    # public routes first, then admin shell
    ├── layouts/
    │   ├── PublicLayout.vue            # header + dynamic nav + footer
    │   ├── AppLayout.vue               # management shell
    │   └── NotFoundPage.vue
    ├── config/menuConfig.ts            # app-specific, stays here (constitution II)
    └── features/
        ├── post/                       # api/ services/ stores/ components/ views/ types/ index.ts
        ├── agenda/
        ├── gallery/
        ├── page/
        ├── taxonomy/                   # config.ts per entity → @241/master-data engine
        └── homepage/

packages/                               # unchanged — no new package
docs/adr/
├── 0005-portal-web-fourth-app.md       # NEW
└── 0006-narrow-admin-permission-bypass.md  # NEW
```

**Structure Decision**: a new frontend app plus a new backend domain of six sibling
modules. No new workspace package: nothing here is consumed by a second app, and
promoting speculatively would violate constitution II ("code used by two or more apps"),
so portal code stays in `apps/portal` until a second consumer actually exists.

The six-module split follows the seams the spec already draws — Post, Agenda, Gallery,
Page, Taxonomy, Media, Homepage each own distinct tables. Building this as one flat
`portal/` module would reproduce exactly the debt the constitution's Compliance Baseline
records against `admission/` (item 7), and the split costs nothing now while costing a
great deal later.

## Delivery Phasing

The phases map to the spec's story priorities. Each is independently shippable.

| Phase | Stories | Delivers |
|---|---|---|
| **A — Portal walking skeleton** | US1, US2 | `apps/portal` exists and builds; `portal/post` module (Berita only); public homepage + listing + detail; visibility predicate; slug generation; sanitization. |
| **B — Operator separation** | US3 | Permission catalogue entries; guard exemption (ADR-0006); portal role seed. **Ship before handing accounts to the humas team.** |
| **C — Editorial depth** | US4, US5, US6 | Full lifecycle + soft delete/restore; optimistic concurrency; taxonomy via `@241/master-data`; `portal/media` usage tracking and public media endpoint. |
| **D — Reach** | US7 | Metadata endpoint, injection layer, sitemap, slug history. |
| **E — Remaining content types** | US8–US11 | Pages + navigation, Agenda, Pengumuman (a Post type — small), Galeri. |

Phase A alone gives the school a public website with live news, which is the MVP the spec
identifies. Phase B is sequenced immediately after because permission boundaries are
cheap to build and expensive to retrofit once accounts exist.

## Complexity Tracking

> Deviations from the constitution that are deliberate and must be justified.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| **Narrowing the `SUPER_ADMIN`/`ADMIN` bypass in `PermissionGuard`** (constitution III names this bypass as its single sanctioned exception) | FR-062 requires that holding a SIAKAD administrative role does not by itself confer the right to publish to the school's public website. The guard currently returns `true` for any user holding `ADMIN` or `SUPER_ADMIN`, so every `portal-*` permission would be satisfied by a SIAKAD admin and FR-060–062 would be unenforceable. The change adds a small exemption list so `portal-*` codes are not covered by the `ADMIN` bypass; `SUPER_ADMIN` keeps it as break-glass. | *Leave the bypass alone and weaken FR-062* — rejected: the requester's stated reason for a separate portal is that its operators may be different people, and a boundary that the top SIAKAD role walks straight through is not a boundary. *Remove `ADMIN` from the bypass entirely* — rejected: every existing `ADMIN` would instantly lose access to everything until explicitly granted, a repo-wide migration far outside this feature. The exemption list is data, not new branching, stays inside the guard where role→permission resolution belongs, and has zero blast radius because no existing code uses a `portal-*` code. Recorded as ADR-0006. |
| **NestJS serves the portal's HTML and injects metadata** (the stack constraint names Vue 3 + Vite; this gives the portal a serving path the other three apps do not have, and couples its hosting to the API process) | FR-065 and SC-013 require rich link previews. WhatsApp and Facebook crawlers do not execute JavaScript, so a client-rendered SPA returns an empty shell and previews show a bare URL. Serving from NestJS puts the injection logic next to the data it needs, where it is unit-testable like any other use case. | *A reverse-proxy or edge-function layer* — architecturally tidier, but needs infrastructure this deployment does not have and moves the logic into configuration the test suite cannot reach. *Adopt Nuxt/SSR* — rejected for v1: a second frontend framework in a workspace whose premise is one shared Vue 3 + Vite stack, for a problem the size of fifteen meta tags. *User-agent sniffing* — rejected as cloaking. *Do nothing* — rejected: WhatsApp sharing is the school's primary distribution channel. Confirmed with the requester; see research.md R3. |

## Post-Design Constitution Re-Check

Re-evaluated after data-model.md and contracts/ were written. No new violations.

Two things the design work changed relative to the pre-Phase-0 assessment, both toward
compliance:

- **Principle VI** initially looked at risk for the homepage endpoint, which reads four
  modules' tables. Resolved by giving `portal/homepage` its own table
  (`PortalHomepageSection`) and having its use case inject `IPostRepository`,
  `IAgendaRepository`, and `IGalleryRepository` rather than querying their models. The
  aggregator owns configuration and borrows content through ports.
- **Principle V's 200-line repository budget** looked tight for `PrismaPostRepository`,
  which carries three content types, four lifecycle states, and the public predicate.
  Resolved by extracting `post.where.ts` (the visibility predicate, shared by every public
  query and by the sitemap), `post.includes.ts`, and `post.writer.ts` up front rather than
  after the budget is breached.

Both ADRs remain required. Complexity Tracking stands at two entries, unchanged.
