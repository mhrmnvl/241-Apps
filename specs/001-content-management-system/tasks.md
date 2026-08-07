---

description: "Task list for School Portal & Content Management System"
---

# Tasks: School Portal & Content Management System

**Input**: Design documents from `/specs/001-content-management-system/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included and **not optional here**. Constitution V states "New backend use cases MUST ship with a `*.spec.ts`" — the repository has 243 backend specs today, so a use case without one fails review. Each backend use-case task therefore names both files. Frontend vitest coverage is targeted at the three things that silently break: the visibility predicate, slug resolution, and the router's public/admin split.

**Organization**: Tasks are grouped by user story so each can be implemented, tested, and shipped independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: US1–US11, mapping to spec.md user stories
- Exact file paths are given in every task

## Path Conventions

Monorepo (see plan.md → Project Structure):

- Backend: `backend/src/portal/<module>/`, schema in `backend/prisma/portal.prisma`
- Frontend: `apps/portal/src/features/<feature>/`, package name `portal-web`
- ADRs: `docs/adr/`

## Decisions confirmed by the requester (2026-08-06)

Both open items from plan.md are now closed, and the tasks below reflect them:

1. **Portal HTML is served by NestJS, with metadata injected server-side** (research R3, Option A). A catch-all controller reads the portal's built `index.html`, injects the metadata from `GetPageMetaUseCase`, and returns it. No new process, no new infrastructure, and the injection logic sits next to its data where it can be unit-tested. See T115.
2. **`SUPER_ADMIN` keeps the permission bypass; `ADMIN` does not.** The `portal-*` exemption in `PermissionGuard` applies to `ADMIN` only, leaving `SUPER_ADMIN` as break-glass so the portal stays recoverable. See T069–T071.

## Two corrections to plan.md, applied below

1. **`slug-builder` and `html-sanitizer` live in `backend/src/shared/helpers/`, not `portal/post/services/`.** plan.md sketched them under the post module, but agenda, gallery, and page all need them; a cross-module import through the post barrel would violate Principle II. They are text utilities with no domain knowledge, which is exactly what `shared/` is for.
2. **`PostCategory` lands in Foundational, not US5.** FR-012 makes a category mandatory to publish, so US1 cannot ship without one. Foundational creates the model and seeds a default set; US5 delivers category *management* and public filtering.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Stand up the fourth workspace app and the new dependencies.

- [X] T001 Create `apps/portal/package.json` with name `portal-web`, mirroring `apps/admission/package.json` scripts exactly — including the full `validate` chain (`format:check → lint → typecheck → lint:strict → build`) and the `@241/ui`, `@241/shared`, `@241/platform` workspace dependencies
- [X] T002 [P] Create `apps/portal/vite.config.ts` on port 5176 with the complete alias set and `dedupe: ['vue', 'pinia', 'vue-router']`, copied from `apps/admission/vite.config.ts`
- [X] T003 [P] Create `apps/portal/tsconfig.json`, `apps/portal/tsconfig.app.json`, and `apps/portal/tsconfig.node.json` mirroring `apps/admission` — the alias set must be declared here a **second** time; declaring it only in Vite yields a build that resolves but fails typecheck
- [X] T004 [P] Create `apps/portal/index.html`, `apps/portal/src/app/style.css` (Tailwind v4 entry), and `apps/portal/public/` with the school logo. Leave a clearly marked placeholder block in `<head>` for the meta tags T115 replaces at serve time
- [X] T005 Add `"dev:portal": "pnpm --filter portal-web dev"` to the root `package.json` scripts
- [X] T006 [P] Add `@tiptap/vue-3`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/extension-link` to `apps/portal/package.json` (research R6 — confined to this app, nothing in `packages/*` gains a dependency)
- [X] T007 [P] Add `sanitize-html`, `@types/sanitize-html`, and `@nestjs/serve-static` to `backend/package.json` (research R6, and R3 Option A for the last one)
- [X] T008 Run `pnpm install`, then run `pnpm typecheck` and `pnpm build` from the root and **confirm `portal-web` appears in the output**. A misnamed package is silently skipped by the `--filter "*-web"` scripts and every root script stays green while checking nothing — the most expensive failure available in this repo
- [X] T009 [P] Write `docs/adr/0005-portal-web-fourth-app.md`: why the portal is not a route tree inside `apps/admission` (different audience, different operators, different availability requirement, and no reason to share a bundle with an app handling applicant personal data)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schema, domain skeleton, shared helpers, and the app shell that every story builds on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

### Schema and enums

- [X] T010 Add `PORTAL` to the `AppKey` enum in `backend/prisma/app-setting.prisma` (research R8 — this is what gives the portal its own branding, its own maintenance flag, and its own storage prefix)
- [X] T011 Add `PORTAL` to `backend/src/shared/domain/enums/app-key.enum.ts`
- [X] T012 Create `backend/prisma/portal.prisma` with the `PostType`, `ContentStatus`, and `MediaUsageKind` enums plus the `Post`, `PostSlugHistory`, and `PostCategory` models per data-model.md §1–3, including every listed index
- [X] T013 Add the `File` and `User` back-relations required by the portal models in `backend/prisma/file.prisma` and `backend/prisma/iam.prisma` — author FKs are `onDelete: Restrict`, which is what preserves attribution under FR-020
- [X] T014 Run `pnpm --filter backend prisma:migrate` and `pnpm --filter backend prisma:generate`
- [X] T015 Add a seed in `backend/prisma/seeds/` creating the `PORTAL` row in `app_settings` and a default `PostCategory` set (Prestasi, Kegiatan, Akademik, Keagamaan)

### Shared helpers

- [X] T016 [P] Implement `backend/src/shared/helpers/slug.helper.ts` (lowercase, collapse non-alphanumerics to `-`, strip leading/trailing hyphens) with spec in `slug.helper.spec.ts`
- [X] T017 [P] Implement `backend/src/shared/helpers/html-sanitizer.service.ts` wrapping `sanitize-html` with an allowlist covering headings, bold/italic, lists, links, block quotes, tables, and images, with spec in `html-sanitizer.service.spec.ts` proving `<script>`, `onerror=`, and `javascript:` hrefs are all stripped

### Backend domain skeleton

- [X] T018 Create `backend/src/portal/portal.module.ts` and register `PortalModule` in `backend/src/app.module.ts`
- [X] T019 Create the `backend/src/portal/post/` module skeleton — `presentation/`, `use-cases/`, `domain/{entities,enums,interfaces}/`, `infrastructure/persistence/`, `dto/{request,response}/`, `constants/`, `post.module.ts`, `index.ts`
- [X] T020 Implement the visibility predicate in `backend/src/portal/post/infrastructure/persistence/post.where.ts` with spec in `post.where.spec.ts` — `deletedAt IS NULL AND status IN (SCHEDULED, PUBLISHED) AND publishedAt <= now()`. The spec must assert that a `SCHEDULED` row whose moment has passed **is** visible without any cron having run (research R1)
- [X] T021 Add the 30 `portal-*` permission entries to `backend/src/platform/access-control/permission/constants/permission-codes.constants.ts` per contracts/permissions.md

### Frontend app shell

- [X] T022 Create `apps/portal/src/app/main.ts` with `configureAuth({ appTitle: 'Portal 241', appSubtitle: ..., logoAlt: ..., loginTitle: ... })` — the `@241/platform` auth feature is brand-neutral by contract and must not be forked
- [X] T023 Create `apps/portal/src/app/providers/router/index.ts` — public shell-less routes registered **first** (they answer to `/`, and the layout route does too), then the admin tree under `AppLayout`, with the auth and `meta.requiredPermission` guards mirroring `apps/admission/src/app/providers/router/index.ts`
- [X] T024 [P] Create `apps/portal/src/layouts/PublicLayout.vue` — header with dynamic navigation slot, content outlet, footer
- [X] T025 [P] Create `apps/portal/src/layouts/AppLayout.vue` and `apps/portal/src/layouts/NotFoundPage.vue`
- [X] T026 [P] Create `apps/portal/src/config/menuConfig.ts` — app-specific, stays in the app per Principle II
- [X] T027 Write `apps/portal/src/app/providers/router/router.spec.ts` proving public routes resolve **outside** the admin shell and that an admin route without permission redirects

**Checkpoint**: schema migrated, portal app boots, public and admin route trees separate. User stories can begin.

---

## Phase 3: User Story 1 - Publish a news item and see it on the portal homepage (Priority: P1) 🎯 MVP

**Goal**: An editor writes a Berita, publishes it, and it appears on the public portal homepage with no deployment.

**Independent Test**: Sign in as an editor, create and publish one news item, then open the homepage in a signed-out browser and confirm it appears. Confirm a draft created in the same session does not, and that guessing its address returns the same 404 as an unknown slug.

### Backend — post module

- [X] T028 [P] [US1] Define `PostEntity` and the `PostType` / `ContentStatus` enums in `backend/src/portal/post/domain/entities/post.entity.ts` and `backend/src/portal/post/domain/enums/`
- [X] T029 [P] [US1] Define the repository port `IPostRepository` with its `*Input` interfaces in `backend/src/portal/post/domain/interfaces/post-repository.interface.ts` — plain interfaces, never DTOs (Principle IV)
- [X] T030 [US1] Implement `backend/src/portal/post/infrastructure/persistence/post.includes.ts` pinning the row shape for list and detail queries
- [X] T031 [US1] Implement `backend/src/portal/post/infrastructure/persistence/post.writer.ts` for create and update payload construction
- [X] T032 [US1] Implement `PrismaPostRepository` in `backend/src/portal/post/infrastructure/persistence/prisma-post.repository.ts`, composing `post.where.ts`, `post.includes.ts`, and `post.writer.ts` — the class stays a flat contract → call map under the 200-line budget
- [X] T033 [P] [US1] Create request DTOs in `backend/src/portal/post/dto/request/` — `create-post.dto.ts`, `update-post.dto.ts`, `publish-post.dto.ts`, `post-query.dto.ts`, `public-post-query.dto.ts`
- [X] T034 [P] [US1] Create response DTOs in `backend/src/portal/post/dto/response/` — `post-admin-detail.dto.ts`, `post-admin-summary.dto.ts`, `post-detail.dto.ts`, `post-summary.dto.ts`
- [X] T035 [US1] Implement `CreatePostUseCase` in `backend/src/portal/post/use-cases/create-post.use-case.ts` with spec in `create-post.use-case.spec.ts` — always creates `DRAFT`, sanitizes `body` on write, generates a unique slug within `type`, maps DTO → Input field by field
- [X] T036 [US1] Implement `UpdatePostUseCase` in `backend/src/portal/post/use-cases/update-post.use-case.ts` with spec — sanitizes on write, preserves `publishedAt`, does not regenerate the slug after first publish
- [X] T037 [US1] Implement `PublishPostUseCase` in `backend/src/portal/post/use-cases/publish-post.use-case.ts` with spec — validates title/summary/body/type/category/cover present (422 naming what is missing); no `scheduledAt` sets `publishedAt = now()` and `status = PUBLISHED`; a future `scheduledAt` sets `publishedAt` to that moment and `status = SCHEDULED`; a past `scheduledAt` returns 400
- [X] T038 [P] [US1] Implement `GetPostsUseCase` (admin list) in `backend/src/portal/post/use-cases/get-posts.use-case.ts` with spec — returns `PaginatedResponse<T>`
- [X] T039 [P] [US1] Implement `GetPostByIdUseCase` in `backend/src/portal/post/use-cases/get-post-by-id.use-case.ts` with spec
- [X] T040 [P] [US1] Implement `GetPublicPostsUseCase` in `backend/src/portal/post/use-cases/get-public-posts.use-case.ts` with spec — composes `post.where.ts`, never its own filter
- [X] T041 [P] [US1] Implement `GetPublicPostBySlugUseCase` in `backend/src/portal/post/use-cases/get-public-post-by-slug.use-case.ts` with spec — a miss returns `NotFoundException` identical to an unknown slug, revealing nothing about drafts
- [X] T042 [US1] Implement the admin controller `backend/src/portal/post/presentation/post.controller.ts` per contracts/portal-admin-api.md, guarded with `@RequirePermissions('portal-posts.*')`, with spec in `post.controller.spec.ts`
- [X] T043 [US1] Implement the public controller `backend/src/portal/post/presentation/post-public.controller.ts` per contracts/portal-public-api.md — `@Public()` + `@Throttle`, following `admission-public.controller.ts`
- [X] T044 [US1] Wire `post.module.ts` with `{ provide: IPostRepository, useClass: PrismaPostRepository }`, export the barrel in `backend/src/portal/post/index.ts`, and register in `portal.module.ts`

### Backend — homepage module

- [X] T045 [P] [US1] Add the `PortalHomepageSection` model to `backend/prisma/portal.prisma` per data-model.md §11, migrate, and seed the four sections
- [X] T046 [US1] Create the `backend/src/portal/homepage/` module with `IHomepageSectionRepository` and its Prisma implementation
- [X] T047 [US1] Implement `GetHomepageUseCase` in `backend/src/portal/homepage/use-cases/get-homepage.use-case.ts` with spec — injects `IPostRepository` (never `this.prisma.post`, Principle VI), returns enabled sections in `displayOrder` with their configured item counts, ordered `pinnedAt DESC NULLS LAST, publishedAt DESC`
- [X] T048 [P] [US1] Implement `UpdateHomepageSectionUseCase` in `backend/src/portal/homepage/use-cases/update-homepage-section.use-case.ts` with spec — `itemCount` bounded 1..12
- [X] T049 [US1] Implement `homepage-public.controller.ts` and `homepage.controller.ts` in `backend/src/portal/homepage/presentation/`, wire `homepage.module.ts`

### Frontend

- [X] T050 [P] [US1] Create `apps/portal/src/features/post/api/postApi.ts` and `publicPostApi.ts` — HTTP only
- [X] T051 [P] [US1] Create `apps/portal/src/features/post/types/index.ts`
- [X] T052 [US1] Create `apps/portal/src/features/post/services/postService.ts` — business logic; views and components go through this, never `api/` directly (Principle I)
- [X] T053 [P] [US1] Create `apps/portal/src/features/post/stores/postStore.ts` (Pinia)
- [X] T054 [US1] Build the rich-text editor component `apps/portal/src/features/post/components/RichTextEditor.vue` on TipTap, styled from `@241/ui` and Tailwind
- [X] T055 [P] [US1] Build `apps/portal/src/features/post/components/CoverImagePicker.vue` — uploads via `POST /files/upload?appKey=PORTAL` and requires alt text
- [X] T056 [US1] Build `apps/portal/src/features/post/views/PostFormView.vue` — vee-validate + Zod, draft save vs publish as distinct actions
- [X] T057 [P] [US1] Build `apps/portal/src/features/post/views/PostListView.vue` with TanStack Vue Table, filtered by type and status
- [X] T058 [US1] Build the public homepage `apps/portal/src/features/homepage/views/HomeView.vue` consuming `GET /portal/public/homepage`, with a neutral empty state when a section has no content (FR-031)
- [X] T059 [P] [US1] Build `apps/portal/src/features/homepage/views/HomepageSectionSettingsView.vue` for the per-section item count
- [X] T060 [US1] Register US1 routes in `apps/portal/src/app/providers/router/index.ts` and add the management entries to `menuConfig.ts`
- [X] T061 [US1] Export the `post` and `homepage` feature barrels in `apps/portal/src/features/*/index.ts`

**Checkpoint**: the school has a public website with live news. This is the shippable MVP.

---

## Phase 4: User Story 2 - Visitors browse and read the full content (Priority: P2)

**Goal**: Public listing and detail pages at stable, shareable addresses.

**Independent Test**: With several published items, page through the public listing as an anonymous visitor, then open a detail page by pasting its address into a fresh browser.

- [X] T062 [P] [US2] Implement `GetRelatedPostsUseCase` in `backend/src/portal/post/use-cases/get-related-posts.use-case.ts` with spec — same category first, then recency, max 4 (FR-025)
- [X] T063 [US2] Add the listing, detail, and related public endpoints to `post-public.controller.ts` per contracts/portal-public-api.md
- [X] T064 [P] [US2] Build `apps/portal/src/features/post/views/PublicPostListView.vue` — paginated, each page reachable by its own address
- [X] T065 [US2] Build `apps/portal/src/features/post/views/PublicPostDetailView.vue` — title, body, cover, publish date, author, category, plus the related list
- [X] T066 [P] [US2] Build `apps/portal/src/features/post/components/PostCard.vue`, shared by the homepage sections and the public listing
- [X] T067 [US2] Register public routes `/berita`, `/berita/:slug`, `/artikel`, `/artikel/:slug` and wire the 404 path so an unknown, draft, or deleted slug renders `NotFoundPage.vue`
- [X] T068 [US2] Write `apps/portal/src/features/post/services/postService.spec.ts` covering the public/draft boundary as the service sees it
- [X] T068a [US2] Implement `PreviewPostUseCase` in `backend/src/portal/post/use-cases/preview-post.use-case.ts` with spec, and add `GET /portal/posts/:id/preview` to `post.controller.ts` guarded by `portal-posts.read` (FR-011, contracts/portal-admin-api.md). It deliberately bypasses the visibility predicate — a draft has no public address, which is the whole point — and is safe because the route is not `@PortalPublic()`. It MUST reuse the same `toPublicDetail` mapper as the public page: a preview assembled from the admin shape drifts the moment either changes, and a preview that lies is worse than none. **Added retroactively** — the contract carried this endpoint from the start but `/speckit-tasks` emitted no task for it, so FR-011 reached implementation with zero task coverage

**Checkpoint**: content is readable and shareable end to end.

---

## Phase 5: User Story 3 - The portal is operated independently from SIAKAD (Priority: P3)

**Goal**: A humas account runs the portal and can read nothing academic; a SIAKAD admin cannot publish.

**Independent Test**: An account holding only `portal-*` codes publishes successfully and is refused on every student, grade, staff, asset, and applicant endpoint. An `ADMIN` without `portal-*` codes is refused on publish.

**⚠️ Ship this before handing accounts to the humas team.** Permission boundaries are cheap to build and expensive to retrofit once accounts exist.

- [X] T069 [US3] Add the `portal-` exemption to `backend/src/platform/access-control/permission/guards/permission.guard.ts` so the `ADMIN` blanket bypass no longer covers `portal-*` codes. **`SUPER_ADMIN` keeps the full bypass** — confirmed by the requester, so the portal stays recoverable if every portal operator is locked out. The exemption is a constant, not new branching, and stays inside the guard where role-to-permission resolution belongs
- [X] T070 [US3] Extend `permission.guard.spec.ts` with the four cases from contracts/permissions.md: `ADMIN` refused a `portal-*` code, `ADMIN` still passing every non-portal code unchanged, `SUPER_ADMIN` passing both, and a portal editor passing portal codes while refused academic ones
- [X] T071 [P] [US3] Write `docs/adr/0006-narrow-admin-permission-bypass.md` recording the decision, the rejected alternatives, and the requester's explicit choice that `SUPER_ADMIN` retains the bypass as break-glass while `ADMIN` does not
- [X] T072 [P] [US3] Seed a `PORTAL_EDITOR` role in `backend/prisma/seeds/` holding the 30 `portal-*` codes plus `files.create` and `files.read`, and nothing else
- [X] T073 [US3] Run `POST /permissions/sync` (or reseed) and verify the catalogue matches every `@RequirePermissions` in the portal controllers
- [X] T074 [US3] Filter `apps/portal/src/config/menuConfig.ts` entries by held permissions so a user without them sees no management surface (FR-063). The router's client-side `SUPER_ADMIN` pass must mirror the guard exactly, or the UI will offer actions the API then refuses
- [X] T075 [US3] Confirm the portal's `AppSetting` maintenance flag is independent — set `maintenanceMode` on `ACADEMIC` and verify the portal homepage still serves (SC-006)

**Checkpoint**: the operator boundary is real and tested, not just documented.

---

## Phase 6: User Story 4 - Manage the editorial lifecycle (Priority: P4)

**Goal**: Draft, schedule, unpublish, archive, soft delete, restore — and no silent overwrites.

**Independent Test**: Walk one item through every state, verifying public visibility at each, then save the same item from two tabs and confirm the second is refused.

- [X] T076 [US4] Add `version Int @default(0)` to `Post` in `backend/prisma/portal.prisma` and migrate (research R5)
- [X] T077 [US4] Add optimistic-lock enforcement to `PrismaPostRepository` — update runs `WHERE id = ? AND version = ?` and increments; zero rows raises `ConflictException` (FR-013)
- [X] T078 [P] [US4] Implement `UnpublishPostUseCase` in `backend/src/portal/post/use-cases/unpublish-post.use-case.ts` with spec — clears `publishedAt` so a later republish is a fresh publication
- [X] T079 [P] [US4] Implement `ArchivePostUseCase` in `backend/src/portal/post/use-cases/archive-post.use-case.ts` with spec — retains `publishedAt`, because archiving is filing, not retraction
- [X] T080 [P] [US4] Implement `DeletePostUseCase` in `backend/src/portal/post/use-cases/delete-post.use-case.ts` with spec — soft delete only
- [X] T081 [P] [US4] Implement `RestorePostUseCase` in `backend/src/portal/post/use-cases/restore-post.use-case.ts` with spec — refuses beyond the 30-day window, returns the item to its prior state (FR-019)
- [X] T082 [P] [US4] Implement `PinPostUseCase` in `backend/src/portal/post/use-cases/pin-post.use-case.ts` with spec — sets/clears `pinnedAt` (FR-030)
- [X] T083 [US4] Implement the status-normalizing cron in `backend/src/portal/post/services/post-status-sync.service.ts` — `@Cron(CronExpression.EVERY_MINUTE)` flipping `SCHEDULED → PUBLISHED`, with spec. Its docblock must state that it is cosmetic: visibility is already correct via `post.where.ts` and nothing public depends on this running (research R1)
- [X] T084 [US4] Add the lifecycle endpoints (`publish`, `unpublish`, `archive`, `pin`, `restore`, soft `DELETE`) to `post.controller.ts`, all guarded by `portal-posts.publish` except delete/restore which use `portal-posts.delete`
- [X] T085 [US4] Write audit-log writes for publish, unpublish, and delete in the respective use cases (FR-064). **The portal is the first module to actually write `AuditLog` rows** — build and test this rather than assuming the infrastructure is already in use
- [X] T086 [US4] Add lifecycle actions, a scheduled-publish date picker, and a deleted-items view with restore to `apps/portal/src/features/post/views/PostListView.vue` and `PostFormView.vue`
- [X] T087 [US4] Surface the `409` conflict in `postService.ts` as a clear "this item changed while you were editing" message rather than a generic error

**Checkpoint**: editors can trust the tool with work in progress.

---

## Phase 7: User Story 5 - Organize content by type, category, and tag (Priority: P5)

**Goal**: Berita and Artikel have separate listings; categories and tags filter both.

**Independent Test**: Create categories, assign items of both types, then filter the public listing by category and by tag as an anonymous visitor.

- [X] T088 [P] [US5] Add the `PostTag` and `PostTagOnPost` models to `backend/prisma/portal.prisma` per data-model.md §4 and migrate
- [X] T089 [US5] Create the `backend/src/portal/taxonomy/` module — `ICategoryRepository`, `ITagRepository`, and their Prisma implementations
- [X] T090 [P] [US5] Implement the category CRUD use cases in `backend/src/portal/taxonomy/use-cases/` with specs — delete raises `ConflictException` naming the count when non-deleted posts still reference it (FR-037)
- [X] T091 [P] [US5] Implement the tag CRUD use cases in `backend/src/portal/taxonomy/use-cases/` with specs — tags are created on first use and shared across content types
- [X] T092 [US5] Implement `taxonomy.controller.ts` and wire `taxonomy.module.ts` per contracts/portal-admin-api.md
- [X] T093 [US5] Extend `GetPublicPostsUseCase` and the public controller with `categorySlug`, `tagSlug`, and `q` filters (FR-023, FR-024)
- [X] T094 [US5] Add the public `GET /portal/public/categories` endpoint returning active categories with published counts
- [X] T095 [P] [US5] Create `apps/portal/src/features/taxonomy/config/categoryConfig.ts` and `tagConfig.ts` implementing `MasterDataConfig<T>` — reference-data CRUD **must** go through `@241/master-data` (ADR-0001), not a hand-built list view
- [X] T096 [US5] Register the category and tag management routes pointing at the `@241/master-data` engine views
- [X] T097 [P] [US5] Add a category/tag filter bar and a search input to `PublicPostListView.vue`
- [X] T098 [US5] Add category selection and tag entry to `PostFormView.vue`

**Checkpoint**: content is navigable once there is enough of it to need sorting.

---

## Phase 8: User Story 6 - Manage images and media centrally (Priority: P6)

**Goal**: Upload once, reuse everywhere, and no file is public unless published content references it.

**Independent Test**: Upload an image, confirm it is unreachable publicly; attach it to a draft, still unreachable; publish, reachable; unpublish, unreachable again — with no flag ever set by hand.

- [X] T099 [US6] Add the `PortalMediaUsage` model to `backend/prisma/portal.prisma` per data-model.md §10 and migrate
- [X] T100 [US6] Create the `backend/src/portal/media/` module with `IMediaUsageRepository` and its Prisma implementation
- [X] T101 [US6] Implement `SyncMediaUsageUseCase` in `backend/src/portal/media/use-cases/sync-media-usage.use-case.ts` with spec — parses media ids out of the sanitized body, adds the explicit cover and attachment refs, and rewrites the rows delete-then-insert inside the same single-module transaction as the content write (Principle VI, ADR-0003)
- [X] T102 [US6] Call `SyncMediaUsageUseCase` from `CreatePostUseCase` and `UpdatePostUseCase`
- [X] T103 [US6] Implement `GetPublicMediaUseCase` in `backend/src/portal/media/use-cases/get-public-media.use-case.ts` with spec — authorized by `EXISTS (usage row whose owner satisfies the visibility predicate)`, injecting `IFileRepository` from `platform/file` rather than touching `this.prisma.file`. Unauthorized returns `404`, never `403` (research R2)
- [X] T104 [US6] Implement `media-public.controller.ts` returning `302` to a freshly-minted signed URL, and `media.controller.ts` exposing the library and the usage lookup (FR-058)
- [X] T105 [US6] Add a portal-usage check to `DeleteFileUseCase` in `backend/src/platform/file/use-cases/delete-file.use-case.ts` — `409` listing the referencing items when usage rows exist, with the spec updated
- [X] T106 [P] [US6] Build `apps/portal/src/features/media/components/MediaLibraryDialog.vue` — pick an existing upload or add a new one, alt text required
- [X] T107 [US6] Point `CoverImagePicker.vue` and the TipTap image extension at the media library, and render every portal image through `/portal/public/media/:fileId` — **never a signed URL**, which is the failure mode research R2 exists to prevent

**Checkpoint**: media authorization is derived from publication state and cannot drift.

---

## Phase 9: User Story 7 - Content is findable and shareable outside the portal (Priority: P7)

**Goal**: WhatsApp shares render as cards; addresses survive title edits; search engines get a sitemap.

**Independent Test**: Publish an item, paste its address into a link-preview checker, then rename its slug and confirm the original address still resolves.

- [X] T108 [P] [US7] Implement slug-history writes in `UpdatePostUseCase` — an explicit slug change on a published item inserts a `PostSlugHistory` row (FR-066)
- [X] T109 [US7] Add slug-history fallback to `GetPublicPostBySlugUseCase` — a miss on `Post.slug` that hits history responds `301` to the current address, with the spec covering both paths
- [X] T110 [P] [US7] Add `metaTitle` and `metaDescription` handling to the create and update use cases, defaulting to `title` and `summary` when unset (FR-068)
- [X] T111 [US7] Implement `GetPageMetaUseCase` in `backend/src/portal/homepage/use-cases/get-page-meta.use-case.ts` with spec — resolves any public path to `{ title, description, canonicalUrl, imageUrl, type, publishedAt }`, where `imageUrl` is always a `/portal/public/media/:fileId?variant=preview` address; `404` for a path resolving to nothing public
- [X] T112 [P] [US7] Implement `GetSitemapUseCase` in `backend/src/portal/homepage/use-cases/get-sitemap.use-case.ts` with spec — every visible item across all types with `lastModified`, and a spec asserting no draft, scheduled, archived, or deleted item ever appears (FR-067)
- [X] T113 [US7] Add `GET /portal/public/meta` and `GET /portal/public/sitemap` to the public controller
- [X] T114 [US7] Generate a **share-preview image variant** at upload time in `backend/src/platform/file/infrastructure/image-optimizer.service.ts` and `upload-file.use-case.ts`: 1200×630, **encoded as JPEG**, stored under a storage key derived from the original, and served by `media-public.controller.ts` under `?variant=preview`. Three reasons this is its own task rather than a detail of T111:
  - The existing optimizer caps at 2000×2000 at quality 80, which for a school event photo is commonly several hundred KB. Link-preview crawlers — WhatsApp in particular — are size-sensitive and will render a card with **no image** rather than fetch a large one. This is the single most common cause of "the preview works sometimes", which reads as a code bug and is not one.
  - 1200×630 is the aspect ratio the major platforms crop to; supplying it directly avoids their arbitrary crop cutting heads off group photos.
  - JPEG rather than WebP specifically for this variant: WebP support across link-preview crawlers is inconsistent, and this is the one image where compatibility matters more than file size.
- [X] T115 [US7] Serve the portal's built `index.html` from NestJS with server-side metadata injection (research R3, Option A — confirmed by the requester). Add `@nestjs/serve-static` for the portal's static assets, plus a catch-all controller in `backend/src/portal/homepage/presentation/portal-html.controller.ts` that reads the built `index.html`, calls `GetPageMetaUseCase` for the requested path, and replaces the placeholder meta block from T004 with `og:title`, `og:description`, `og:image`, `og:url`, `og:type`, `og:site_name`, and `twitter:card`. With spec in `portal-html.controller.spec.ts`. Two rules the spec must enforce:
  - **Inject for every request, never only for crawler user-agents.** Serving different HTML to bots than to people is cloaking; it risks a search penalty and Google no longer recommends dynamic rendering. Browsers simply ignore meta tags they do not use
  - **A path with no public metadata falls back to the portal's default tags** rather than inventing any, and still returns the SPA shell so client-side routing renders the 404 page
- [X] T116 [P] [US7] Add per-item SEO title and description fields to `PostFormView.vue` with a live preview of how the share card will read

**Checkpoint**: content circulates instead of sitting on a site nobody links to.

---

## Phase 10: User Story 8 - Maintain the school's information pages and navigation (Priority: P8)

**Goal**: Profil, Visi & Misi, Sejarah, and Kontak are editable by staff, and staff control the public menu.

**Independent Test**: Publish an informational page, add it to navigation, reorder the menu, and confirm the public site reflects both without a deployment.

- [X] T117 [P] [US8] Add the `PortalPage`, `PortalPageSlugHistory`, and `PortalNavItem` models to `backend/prisma/portal.prisma` per data-model.md §8–9 and migrate
- [X] T118 [US8] Create the `backend/src/portal/page/` module with `IPageRepository`, `INavigationRepository`, and their Prisma implementations
- [X] T119 [P] [US8] Implement the page CRUD, publish, and unpublish use cases in `backend/src/portal/page/use-cases/` with specs — sanitized body, slug history on change
- [X] T120 [P] [US8] Implement the navigation CRUD and reorder use cases with specs — exactly one of `pageId` / `routeKey` / `externalUrl` set, otherwise `400`
- [X] T121 [US8] Implement `page.controller.ts` and `page-public.controller.ts`; the public navigation endpoint omits items pointing at unpublished pages rather than linking into a 404 (FR-053)
- [X] T122 [P] [US8] Build `apps/portal/src/features/page/views/PageListView.vue` and `PageFormView.vue` reusing `RichTextEditor.vue`
- [X] T123 [P] [US8] Build `apps/portal/src/features/page/views/NavigationSettingsView.vue` with drag-to-reorder
- [X] T124 [US8] Build `apps/portal/src/features/page/views/PublicPageView.vue` and register the catch-all `/:pageSlug` route **after** every named public route
- [X] T125 [US8] Consume `GET /portal/public/navigation` in `PublicLayout.vue`, including a link to the PPDB application (FR-004)

---

## Phase 11: User Story 9 - Publish the school's public agenda (Priority: P9)

**Goal**: Upcoming school activities on the homepage and in a full agenda listing.

**Independent Test**: Create entries dated past and future; confirm the homepage shows only nearest-upcoming ascending, and that a past entry leaves that view while staying at its address.

- [X] T126 [P] [US9] Add the `AgendaEntry` model to `backend/prisma/portal.prisma` per data-model.md §5 and migrate
- [X] T127 [US9] Create the `backend/src/portal/agenda/` module with `IAgendaRepository`, its Prisma implementation, and `agenda.where.ts` holding the upcoming/past predicates
- [X] T128 [P] [US9] Implement the agenda CRUD and lifecycle use cases in `backend/src/portal/agenda/use-cases/` with specs — `endTime <= startTime` returns `400` (FR-042)
- [X] T129 [US9] Implement `GetPublicAgendaUseCase` with spec — `scope=upcoming` is `[VISIBLE] AND endTime >= now()` ordered `startTime ASC`; the spec must cover a multi-day entry spanning 30 Dec – 2 Jan staying upcoming for its whole run
- [X] T130 [US9] Implement `agenda.controller.ts` and `agenda-public.controller.ts`, wire `agenda.module.ts`
- [X] T131 [US9] Extend `GetHomepageUseCase` to inject `IAgendaRepository` and populate the agenda section, with the spec updated
- [X] T132 [P] [US9] Build `apps/portal/src/features/agenda/views/AgendaListView.vue` and `AgendaFormView.vue`
- [X] T133 [P] [US9] Build `PublicAgendaListView.vue` (upcoming/past tabs) and `PublicAgendaDetailView.vue`, and add the homepage agenda section

---

## Phase 12: User Story 10 - Publish public announcements (Priority: P10)

**Goal**: Public notices with an optional attachment and expiry, wholly separate from SIAKAD's classroom announcements.

**Independent Test**: Publish an announcement with an attachment and a near expiry; download the attachment while signed out; after expiry confirm it leaves the active list but stays at its address.

- [X] T134 [US10] Add `expiresAt` and `attachmentFileId` to `Post` in `backend/prisma/portal.prisma` and migrate — both nullable, both rejected for `BERITA` and `ARTIKEL`
- [X] T135 [US10] Add the `PENGUMUMAN` type validation to `CreatePostUseCase` and `UpdatePostUseCase` with the specs updated
- [X] T136 [US10] Add the expiry predicate to `post.where.ts` — `scope=active` applies `expiresAt IS NULL OR expiresAt > now()`; the detail endpoint ignores expiry entirely so an expired notice stays reachable (FR-044), with the spec covering both
- [X] T137 [US10] Record the attachment in `SyncMediaUsageUseCase` as `MediaUsageKind.ATTACHMENT` so it becomes publicly downloadable exactly while the announcement is published (FR-045)
- [X] T138 [US10] Extend `GetHomepageUseCase` to populate the active-announcements section, with the spec updated
- [X] T139 [P] [US10] Add attachment upload and an expiry date picker to `PostFormView.vue` for the `PENGUMUMAN` type
- [X] T140 [P] [US10] Build `PublicAnnouncementListView.vue` (active/archive) and add the homepage announcements section
- [X] T141 [US10] Add a test asserting an internal `Announcement` row in SIAKAD never appears on any portal endpoint (FR-046)

---

## Phase 13: User Story 11 - Publish photo galleries (Priority: P11)

**Goal**: Albums of school activities, ordered and captioned, browsable full-size.

**Independent Test**: Create an album, reorder photos, publish, and confirm a visitor can browse and open each photo at full size.

- [X] T142 [P] [US11] Add the `GalleryAlbum` and `GalleryPhoto` models to `backend/prisma/portal.prisma` per data-model.md §6–7 and migrate
- [X] T143 [US11] Create the `backend/src/portal/gallery/` module with `IGalleryRepository` and its Prisma implementation
- [X] T144 [P] [US11] Implement the album CRUD and lifecycle use cases in `backend/src/portal/gallery/use-cases/` with specs — publishing an album with zero photos returns `422` (FR-051)
- [X] T145 [P] [US11] Implement the photo add, remove, and reorder use cases in `backend/src/portal/gallery/use-cases/` with specs — alt text required on every photo (FR-057)
- [X] T146 [US11] Register album photos in `SyncMediaUsageUseCase` as `MediaUsageKind.ALBUM_PHOTO`
- [X] T147 [US11] Implement `gallery.controller.ts` and `gallery-public.controller.ts` with the album detail response paginating photos, wire `gallery.module.ts`
- [X] T148 [US11] Extend `GetHomepageUseCase` to inject `IGalleryRepository` and populate the gallery section, with the spec updated
- [X] T149 [P] [US11] Build `apps/portal/src/features/gallery/views/AlbumListView.vue` and `AlbumFormView.vue` with batch upload and drag-to-reorder
- [X] T150 [US11] Build `PublicAlbumListView.vue` and `PublicAlbumDetailView.vue` with a lightbox and progressive loading, so a 50-photo album is usable within 3s on a mobile connection (FR-050, SC-015)

**Checkpoint**: every content type in the spec is delivered.

---

## Phase 14: Polish & Cross-Cutting Concerns

- [X] T151 Add response caching to every `/portal/public/*` read via the existing `AppCacheModule`, invalidated on publish, unpublish, update-of-published, and delete (research R9)
- [X] T152 Add a dedicated throttle bucket for the `/portal/public/*` prefix in `backend/src/app.module.ts` so scraping cannot degrade SIAKAD, inventory, or PPDB (FR-027, SC-012)
- [X] T153 [P] Write an e2e test in `backend/test/` sweeping **every** content type in **every** unpublished state (draft, scheduled-future, archived, soft-deleted) against **every** public endpoint, asserting a uniform `404`. This is the automated form of SC-004 and the one guarantee worth proving exhaustively rather than by hand
- [X] T154 [P] Verify every Prisma repository in `backend/src/portal/` is under the 200-line budget; split into `*.includes.ts` / `*.where.ts` / `*.writer.ts` where not (Constitution V)
- [X] T155 [P] Confirm every portal module exposes an `index.ts` barrel and that no DTO imports one (the ESM cycle that crashes boot)
- [X] T156 [P] Add the portal row to the repository table in `CLAUDE.md` and record the new domain vocabulary in `CONTEXT.md`
- [X] T157 [P] Re-survey the Compliance Baseline in `.specify/memory/constitution.md` — the portal adds a fourth app and a seventh backend domain, and the baseline says it must be re-surveyed on amendment
- [X] T158 Load-test the public surface, recording the run and its results in `specs/001-content-management-system/quickstart.md` under Gate checks — against SC-007 (2.5s on 4G), SC-012 (10k monthly visitors with no SIAKAD degradation), and SC-010 (management search over 500 items)
- [X] T159 Run every scenario in `quickstart.md` end to end, including the media authorization sweep in Scenario 5 and the `curl`-direct sanitization check in Scenario 6

---

## Dependencies & Execution Order

### Phase dependencies

- **Setup (Phase 1)**: no dependencies
- **Foundational (Phase 2)**: depends on Setup — **blocks every user story**
- **US1 (Phase 3)**: depends on Foundational only
- **US2 (Phase 4)**: depends on US1 (needs the post module and published content)
- **US3 (Phase 5)**: depends on Foundational only — **can run in parallel with US1/US2**
- **US4 (Phase 6)**: depends on US1
- **US5 (Phase 7)**: depends on US1
- **US6 (Phase 8)**: depends on US1
- **US7 (Phase 9)**: depends on US2 (slug history needs public detail resolution) and on US6 (T114's preview variant extends the media pipeline)
- **US8 (Phase 10)**: depends on Foundational only — **independent of the post pipeline**
- **US9 (Phase 11)**: depends on US1 (extends the homepage aggregator)
- **US10 (Phase 12)**: depends on US1 and US6 (attachments need media usage)
- **US11 (Phase 13)**: depends on US6 (albums are unworkable without media handling)
- **Polish (Phase 14)**: depends on the stories you choose to ship

### Within each story

Models → repository ports → repository implementation → DTOs → use cases → controllers → module wiring → frontend service → frontend views.

### Parallel opportunities

- Setup: T002, T003, T004, T006, T007, T009 all run together
- Foundational: T016 and T017 together; T024, T025, T026 together
- US1: T028/T029 together; T033/T034 together; T038–T041 together (four independent read use cases); T050/T051/T053 together
- US7: T114 (media pipeline) is independent of T108–T113 (metadata and slug history) and can run alongside them; T115 needs both
- **US3 and US8 are the two stories that need nothing from the post pipeline** — with more than one developer, run either alongside US1
- Every task marked [P] touches a different file from its siblings and depends on nothing incomplete

---

## Parallel Example: User Story 1

```bash
# Four independent read use cases, different files, same repository port:
Task: "Implement GetPostsUseCase in backend/src/portal/post/use-cases/get-posts.use-case.ts"
Task: "Implement GetPostByIdUseCase in backend/src/portal/post/use-cases/get-post-by-id.use-case.ts"
Task: "Implement GetPublicPostsUseCase in backend/src/portal/post/use-cases/get-public-posts.use-case.ts"
Task: "Implement GetPublicPostBySlugUseCase in backend/src/portal/post/use-cases/get-public-post-by-slug.use-case.ts"

# Frontend scaffolding, all independent:
Task: "Create apps/portal/src/features/post/api/postApi.ts"
Task: "Create apps/portal/src/features/post/types/index.ts"
Task: "Create apps/portal/src/features/post/stores/postStore.ts"
```

---

## Implementation Strategy

### MVP (Phases 1–3, T001–T061)

Setup → Foundational → US1. Stop and validate against quickstart.md Scenario 1. At this
point the school has a public website whose news is live and editable without a
deployment — more than it has today, and demonstrable.

### Recommended shipping order

1. **Phases 1–3** → MVP, demo it
2. **Phase 5 (US3)** next, out of priority order and deliberately: hand no account to the
   humas team before the permission boundary exists and is tested. Retrofitting it after
   accounts are distributed is far harder than building it now
3. **Phase 4 (US2)** → content is readable and shareable
4. **Phases 6–8 (US4–US6)** → the tool becomes trustworthy for daily use
5. **Phase 9 (US7)** → content starts circulating on WhatsApp and in search
6. **Phases 10–13 (US8–US11)** → the remaining content types
7. **Phase 14** → caching, throttling, the SC-004 sweep, load testing

### Parallel team strategy

After Foundational, three tracks run without collision: US1→US2→US4 (the post pipeline),
US3 (permissions and guard), US8 (pages and navigation). They touch disjoint files and
converge only at the homepage aggregator and the router.

---

## Notes

- **The visibility predicate is the single most important invariant here.** Any public
  query that inlines its own filter instead of composing `post.where.ts` is a latent leak
  of unpublished content — which is exactly what T153 exists to catch.
- **T085 is not a formality.** The constitution records that no module currently writes
  `AuditLog` rows, so the portal is the first real user of that infrastructure. Treat it as
  implementation, not configuration.
- **T114 and T115 are one feature split across two layers**, and shipping T115 without T114
  produces link previews that work in testing and fail intermittently in the wild — the
  hardest kind of bug to attribute, because nothing in the code is wrong.
- No open decisions remain. Both items that were pending after `/speckit-plan` — the
  metadata-injection hosting shape and the `SUPER_ADMIN` bypass — are recorded at the top of
  this file and reflected in T069, T071, T114, and T115.
- Commit per task or per logical group; stop at any checkpoint to validate a story on its own.
