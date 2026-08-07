# Phase 0 Research: School Portal & Content Management System

**Feature**: `001-content-management-system` | **Date**: 2026-08-06

Nine decisions. Each was checked against the code rather than assumed — the file
references are what the repository actually contains today.

---

## R1 — Public visibility is computed at read time, not stored

**Decision**: An item is publicly visible when

```text
deletedAt IS NULL
AND status IN ('SCHEDULED', 'PUBLISHED')
AND publishedAt <= now()
```

This single predicate lives in `post.where.ts` and is used by every public query, the
sitemap, the homepage aggregator, and the media authorization check. A cron running every
minute flips `SCHEDULED → PUBLISHED` **only** so the management list shows an accurate
label. Correctness never depends on the cron.

**Rationale**: FR-016 requires a scheduled item to go live "without a staff member or
visitor triggering it". The obvious implementation is a job that flips a boolean, but that
makes a background process the source of truth for what the public can see: if the job is
down for an hour, the school's announcement is late and nothing reports it. Deriving
visibility from the timestamp makes lateness impossible — the row is public the moment its
own `publishedAt` passes, whatever the job is doing.

The same predicate shape covers the two other time-driven requirements with no extra
machinery: agenda upcoming/past is `endTime >= now()` (FR-041) and announcement expiry is
`expiresAt IS NULL OR expiresAt > now()` (FR-044).

`@nestjs/schedule@6.1.3` is already a dependency and `ScheduleModule.forRoot()` is already
imported in `backend/src/app.module.ts:28`, with `@Cron` precedent in
`platform/auth/services/auth-cleanup.service.ts:13`. No new infrastructure.

**Alternatives considered**:

- *Cron flips a boolean; queries read the boolean.* Rejected — makes a background job
  load-bearing for public correctness, and silently.
- *No stored status at all, everything derived.* Rejected — the management list needs to
  distinguish "draft with no date" from "scheduled" from "archived", and archiving is a
  human decision with no timestamp to derive it from.
- *Database-level scheduled jobs (pg_cron).* Rejected — moves logic out of the codebase
  and out of the test suite for no gain.

**Consequence for implementation**: the predicate must never be retyped inline. Any public
query that hand-rolls its filter is a latent leak of unpublished content, which is exactly
what SC-004 measures.

---

## R2 — Media becomes public by being referenced, not by being flagged

**Decision**: A `PortalMediaUsage` table records every reference from portal content to a
file (cover image, in-body image, album photo, announcement attachment). A public endpoint
`GET /portal/public/media/:fileId` returns `302` to a freshly-minted signed URL, but only
if that file has at least one usage row belonging to currently-published content (R1's
predicate). Usage rows are rewritten on every content save, parsed from the sanitized body
plus the explicit cover/attachment fields.

**Rationale**: this is the constraint that most shapes the design, and it is not obvious
from the spec. `core/storage/storage.service.ts` documents the bucket as private and hands
out signed URLs with a configured `S3_SIGNED_URL_EXPIRY_SECONDS`; `upload-file.use-case.ts`
returns `{ ...entity, url: await this.storage.getSignedUrl(storageKey) }`. That works for
an internal app where the client fetches a fresh URL each session. It cannot work for a
public website:

- A link-preview crawler fetches `og:image` when the link is shared and caches its own
  copy — but if it retries later, or the school shares an old link, an expired URL yields
  a broken preview. FR-065 and SC-013 fail intermittently and unreproducibly.
- Search engines index image URLs that must stay valid.
- Every list render would mint one signed URL per thumbnail, adding S3 signing work to a
  page that should be cacheable.

Deriving publicness from usage — rather than adding an `isPublic` flag to `File` — gives
three properties worth having. Unpublishing an item revokes its images with no second
action to forget. A file uploaded but not yet referenced is never reachable. And the same
table answers FR-058 ("refuse to delete a file still referenced, and identify the items
referencing it") directly, instead of requiring a scan of every content body.

**Alternatives considered**:

- *Make the bucket, or a `public/` prefix, world-readable.* Rejected for v1 — it requires
  bucket-policy changes that differ between MinIO and the eventual production S3, and it
  makes publicness a property of where a file was uploaded rather than of whether it is in
  use. Worth revisiting as a performance upgrade once traffic justifies a CDN, at which
  point the stable endpoint URL can simply become a CDN origin.
- *Long-lived signed URLs (a year).* Rejected — an expiring credential pasted into search
  indexes and chat histories is a credential leak with a slow fuse, and it still expires.
- *Proxy the bytes through NestJS.* Rejected — puts image traffic through the API process
  for no benefit over a redirect; crawlers and browsers follow `302` fine.

---

## R3 — Link previews need server-injected metadata (largest external dependency)

**Decision** (Option A, confirmed by the requester 2026-08-06): **NestJS serves the
portal's built `index.html` and injects the metadata itself.** A catch-all controller reads
the built file, calls `GetPageMetaUseCase` for the requested path, and replaces a
placeholder meta block before responding. `@nestjs/serve-static` handles the portal's other
static assets. `GET /portal/public/meta?path=<public path>` remains a public endpoint so the
same metadata is available to anything else that needs it.

Two rules the implementation must hold:

- **Inject for every request, never only for crawler user-agents.** Serving different HTML
  to bots than to people is cloaking — it risks a search penalty, and Google no longer
  recommends dynamic rendering. Browsers ignore meta tags they do not use, so there is no
  cost to injecting universally.
- **A path with no public metadata falls back to the portal's default tags** and still
  returns the SPA shell, so client-side routing renders the 404 page.

**Also required, and easy to miss**: a dedicated 1200×630 **JPEG** share-preview variant,
generated at upload. The existing optimizer caps at 2000×2000 at quality 80, which for a
school event photo is commonly several hundred KB — and link-preview crawlers, WhatsApp
especially, are size-sensitive and will render a card with *no image* rather than fetch a
large one. That failure is intermittent and looks exactly like a code bug. JPEG rather than
WebP for this one variant, because WebP support across preview crawlers is inconsistent and
compatibility outranks file size here.

**Rationale**: WhatsApp's and Facebook's crawlers do not execute JavaScript. A
client-rendered Vue SPA serves them an empty `<div id="app">`, so a shared link renders as
a bare URL. For a madrasah, WhatsApp group sharing is the primary distribution channel —
this is the difference between content that circulates and content nobody sees.

Google is a different case and worth separating, because conflating the two leads to
overbuilding: Googlebot does render JavaScript, so a client-rendered SPA *is* indexed,
just more slowly. SC-014 ("discoverable within one indexing cycle") is therefore largely
met without any of this. **The injection layer is specifically about sharing, not search.**

**Why serving from NestJS rather than a separate layer**: the backend already holds the
data, so the injection logic sits next to it and can be unit-tested like any other use
case, instead of living in a proxy config that no test ever exercises. It adds no process
and no infrastructure. The trade-off is that portal hosting is coupled to the backend
process — acceptable at this scale, and separable later by putting a CDN in front without
touching the logic.

**Alternatives considered**:

- *Reverse-proxy or edge-function injection (Nginx `sub_filter`, Cloudflare Worker).*
  Architecturally tidier — static stays static — but it requires infrastructure this
  deployment does not currently have, and it moves the logic into configuration that the
  test suite cannot reach. Revisit if the portal is ever hosted separately from the API.
- *Adopt Nuxt/SSR for the portal.* The technically cleanest answer, and rejected for v1: it
  puts a second frontend framework into a workspace whose premise is one shared Vue 3 + Vite
  stack, and reopens how `packages/*` are consumed as raw source — all for a problem the
  size of fifteen meta tags. Recorded here as the upgrade path if organic search ever
  outranks sharing.
- *Prerender at build time.* Rejected — content changes hourly; a build-time snapshot is
  stale by definition.
- *User-agent sniffing so only crawlers get injected HTML.* Rejected — that is cloaking,
  and it doubles the number of code paths that can be wrong.
- *Accept broken previews.* Rejected — it silently defeats US7, SC-013, and most of the
  reason to publish.

---

## R4 — One `Post` model with a type discriminator

**Decision**: Berita, Artikel, and Pengumuman are one `Post` model with
`type: PostType`. Pengumuman-only fields (`attachmentFileId`, `expiresAt`) are nullable
columns. Agenda, Gallery, and Page are separate models. Slug uniqueness is
`@@unique([type, slug])`.

**Rationale**: FR-035 states these three share one authoring experience and one lifecycle,
differing only in type-specific fields and public placement — which is the definition of a
discriminated model rather than three tables. This is also the settled pattern in every
mature CMS (WordPress `post_type`, Strapi collection types), for a reason worth naming:
three tables means three repositories, three sets of lifecycle use cases, three sitemap
branches, and three chances for the visibility predicate to drift apart. R1's whole value
depends on there being one place to write it.

Agenda is genuinely different — ordered forward in time, bounded by `startTime`/`endTime`,
with a location — and forcing it into the same table would mean nullable columns that are
mandatory for one type and meaningless for the others. Gallery is a parent with an ordered
child collection. Page has no feed, no category, no tags. Those three earn their own
models; Pengumuman does not.

**Alternatives considered**:

- *A table per content type.* Rejected — duplicates the lifecycle six ways.
- *One table for everything including Agenda and Gallery.* Rejected — Agenda's mandatory
  time range and Gallery's photo collection would both be nullable, unenforceable columns.

---

## R5 — Optimistic concurrency via a version column

**Decision**: every editable content model carries `version Int @default(0)`. Updates run
`WHERE id = ? AND version = ?` and increment it; zero affected rows raises
`ConflictException`. The client sends the version it loaded.

**Rationale**: FR-013 requires that a second editor's save not silently discard the first's
work. Optimistic locking is the standard answer, needs no session state, and costs one
integer. Pessimistic locking would need lock ownership, expiry, and a way to break a lock
held by someone who closed their laptop — all for a two-person editorial team.

**Alternatives considered**:

- *Compare `updatedAt`.* Works, but couples correctness to clock and column precision.
  An explicit counter states the intent.
- *Last-write-wins.* Rejected — it is the exact failure FR-013 names.

---

## R6 — New dependencies, and why each is unavoidable

The constitution requires justifying cross-cutting dependencies in the plan.

**Backend: `sanitize-html` (+ `@types/sanitize-html`)**

FR-010 requires that authored markup cannot execute in a visitor's browser. Rich text plus
anonymous public rendering is the classic stored-XSS path, and this is the one requirement
here where being wrong is a security incident rather than a bug. Sanitization must run
**server-side on write**: the API is the trust boundary, and a client-side sanitizer is
bypassed by anyone who calls the endpoint directly. Storing sanitized HTML also means the
public read path does no sanitization work at all. No existing backend dependency does
this — `sharp` handles images only.

**Frontend (`apps/portal` only): `@tiptap/vue-3`, `@tiptap/starter-kit`,
`@tiptap/extension-image`, `@tiptap/extension-link`**

FR-009 requires headings, bold/italic, lists, links, quotes, and embedded images. TipTap is
the standard Vue 3 rich-text editor, is headless (so it takes styling from Tailwind and
`@241/ui` rather than fighting them), and its `extension-image` integrates with the upload
flow that FR-055 needs. Confined to `apps/portal`; nothing in `packages/*` gains a
dependency.

*Alternative considered*: a markdown textarea, zero dependencies. Rejected on the users —
the humas staff this is built for are not going to write markdown, and SC-001 asks a
first-time user to publish within ten minutes.

**Not added**: no slug library (a dozen lines of transliteration and hyphenation, plus a
uniqueness probe against the database that a library cannot do anyway); no date library on
the backend; no new frontend HTTP or state libraries.

---

## R7 — Where the portal's permissions live, and the `ADMIN` bypass

**Decision**: new permission modules `portal-posts`, `portal-agendas`, `portal-albums`,
`portal-pages`, `portal-categories`, `portal-tags`, `portal-settings`, each with
`create | read | update | delete` and, where publishing applies, `publish`. Added to
`SYSTEM_PERMISSIONS` in
`platform/access-control/permission/constants/permission-codes.constants.ts`.
`PermissionGuard` gains an exemption list so `portal-*` codes are not satisfied by the
`ADMIN` role bypass. `SUPER_ADMIN` keeps its bypass as break-glass.

**Rationale**: FR-059 wants publish separated from create/edit, which the existing
`module.action` catalogue expresses directly — `publish` is simply a fifth action.
FR-060–061 are then satisfied by construction: a portal operator is granted only
`portal-*` codes and holds nothing academic.

FR-062 is the one that collides with the code. `permission.guard.ts:38-45` returns `true`
for any user holding `ADMIN` or `SUPER_ADMIN`, before permissions are consulted at all. The
constitution names this the single sanctioned exception. Left as-is, every SIAKAD admin
could publish to the school's public website and FR-062 would be undeliverable — so this
must be a decision, not an oversight.

The exemption list is the narrowest fix that works: it is data (`PORTAL_PERMISSION_PREFIX`),
it lives inside the guard where role-to-permission resolution belongs, and its blast radius
is zero because no existing endpoint uses a `portal-*` code. Recorded as ADR-0006 and in
the plan's Complexity Tracking; see there for the rejected alternatives.

**Confirmed by the requester (2026-08-06)**: `SUPER_ADMIN` keeps the bypass and `ADMIN` does
not. The exemption therefore covers the `ADMIN` role only, leaving exactly one account type
able to recover the portal if every portal operator is locked out. FR-062 is read as
applying to SIAKAD's administrative role, with `SUPER_ADMIN` as the documented break-glass
exception.

---

## R8 — The portal gets its own `AppKey`

**Decision**: add `PORTAL` to the `AppKey` enum in `backend/prisma/app-setting.prisma` and
`backend/src/shared/domain/enums/app-key.enum.ts`, with a migration seeding a `PORTAL` row
in `app_settings`.

**Rationale**: `AppKey` already drives three things the portal needs for free. Branding and
metadata come from the per-app `AppSetting` row, reachable before login via the existing
`@Public()` endpoint at `settings.controller.ts:46`. Maintenance mode is per-app, which is
precisely what makes FR-003 and SC-006 structural rather than something to remember — the
portal simply is not affected when SIAKAD's flag is set. And `StorageKeyBuilder.build()`
takes `AppKey` as its first segment, so portal uploads land under `{env}/portal/...`
without inventing a prefix.

**Consequence**: this touches a shared enum and needs a Prisma migration, so it lands in
Phase A rather than being deferred.

---

## R9 — Caching and rate limiting on the public surface

**Decision**: all public read endpoints sit under the `/portal/public/*` prefix. They are
`@Public()` and throttled, following the `admission-public.controller.ts` precedent. List,
detail, and homepage responses are cached in the existing `AppCacheModule` with a short TTL
and invalidated on publish, unpublish, and delete.

**Rationale**: FR-027 requires that scraping cannot degrade service, and SC-012 requires
that 10,000 monthly visitors leave SIAKAD, inventory, and PPDB unaffected. Public content
is the ideal cache target — read-overwhelmingly, identical for every visitor, and with
explicit invalidation points, since content only changes when someone acts on it.

The single URL prefix is deliberate: it makes the public surface something you can point a
throttle, a cache rule, or a CDN at as one unit, instead of a set of routes someone has to
enumerate correctly.

**Alternatives considered**:

- *Per-endpoint public flags scattered across controllers.* Rejected — the public surface
  should be greppable in one place, since SC-004 is a claim about all of it at once.
- *No caching in v1.* Rejected — invalidation points are obvious now and retrofitting
  caching after the read paths multiply is harder than building it in.

---

## Resolved unknowns

| Unknown from Technical Context | Resolution |
|---|---|
| Scheduled publishing mechanism | R1 — read-time predicate; `@nestjs/schedule` already installed, cron is cosmetic |
| Public media delivery from a private bucket | R2 — usage-derived authorization + stable redirect endpoint |
| Link previews from a client-rendered SPA | R3 — NestJS serves `index.html` and injects metadata server-side (Option A, confirmed), plus a 1200×630 JPEG preview variant |
| Content model for six types | R4 — one `Post` with discriminator; Agenda/Gallery/Page separate |
| Concurrent edit protection | R5 — version column, optimistic locking |
| Rich text and sanitization libraries | R6 — TipTap (portal app only), `sanitize-html` (backend, server-side on write) |
| Permission split and the `ADMIN` bypass | R7 — `portal-*` catalogue + narrowed guard bypass (ADR-0006) |
| Portal branding, maintenance isolation, storage prefix | R8 — new `PORTAL` `AppKey` |
| Public-surface throttling and caching | R9 — single `/portal/public/*` prefix, existing throttler and cache module |
