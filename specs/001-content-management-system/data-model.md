# Phase 1 Data Model: School Portal & Content Management System

**Feature**: `001-content-management-system` | **Date**: 2026-08-06

All models live in a new per-domain schema file `backend/prisma/portal.prisma`
(constitution: a new model goes in its domain's file, never a monolithic `schema.prisma`).
Conventions follow the existing schema files: `uuid()` primary keys as `@db.Uuid`,
`snake_case` via `@map`, soft delete as `deletedAt`, table names pluralised in `@@map`.

Module ownership is listed per model and is enforced by review, not by the database —
Principle VI exists because Prisma will happily join across every domain in the schema.

---

## Enums

```text
PostType        BERITA | ARTIKEL | PENGUMUMAN
ContentStatus   DRAFT | SCHEDULED | PUBLISHED | ARCHIVED
MediaUsageKind  COVER | BODY | ATTACHMENT | ALBUM_PHOTO
```

`AppKey` (existing, in `app-setting.prisma`) gains a fourth member: `PORTAL`.

---

## The visibility predicate

Referenced throughout as **[VISIBLE]**. Defined once in
`portal/post/infrastructure/persistence/post.where.ts` and reused by every public query,
the sitemap, the homepage aggregator, and the media authorization check.

```text
deletedAt IS NULL
AND status IN ('SCHEDULED', 'PUBLISHED')
AND publishedAt IS NOT NULL
AND publishedAt <= now()
```

`SCHEDULED` is included deliberately: an item whose moment has arrived is public whether or
not the normalizing cron has run yet (research R1). Any public query that inlines its own
filter instead of composing this one is a latent leak of unpublished content — the exact
thing SC-004 measures.

---

## 1. Post — *module: `portal/post`*

Berita, Artikel, and Pengumuman in one discriminated model (research R4).

| Field | Type | Notes |
|---|---|---|
| `id` | `String @id @default(uuid()) @db.Uuid` | |
| `type` | `PostType` | Discriminator; drives public listing and address space |
| `title` | `String @db.VarChar(200)` | FR-006 |
| `slug` | `String @db.VarChar(220)` | Unique per type — see indexes |
| `summary` | `String @db.VarChar(500)` | Feed excerpt and default meta description |
| `body` | `String @db.Text` | Sanitized HTML, stored post-sanitization (FR-010) |
| `coverFileId` | `String? @db.Uuid` | → `File`. Required to publish, nullable in draft |
| `categoryId` | `String? @db.Uuid` | → `PostCategory`. Required to publish (FR-012) |
| `status` | `ContentStatus @default(DRAFT)` | |
| `publishedAt` | `DateTime?` | Set on first publish; **preserved** across edits (FR-018) |
| `scheduledAt` | `DateTime?` | Requested go-live; copied into `publishedAt` on schedule |
| `expiresAt` | `DateTime?` | PENGUMUMAN only (FR-044) |
| `attachmentFileId` | `String? @db.Uuid` | PENGUMUMAN only → `File` (FR-043) |
| `pinnedAt` | `DateTime?` | Homepage pinning (FR-030); sorts before date |
| `metaTitle` | `String? @db.VarChar(200)` | FR-068, defaults to `title` |
| `metaDescription` | `String? @db.VarChar(300)` | FR-068, defaults to `summary` |
| `authorId` | `String @db.Uuid` | → `User`. `onDelete: Restrict` — attribution survives (FR-020) |
| `version` | `Int @default(0)` | Optimistic lock (research R5) |
| `createdAt` / `updatedAt` | `DateTime` | `@default(now())` / `@updatedAt` |
| `deletedAt` | `DateTime?` | Soft delete, 30-day restore window (FR-019) |

**Indexes**

- `@@unique([type, slug])` — FR-007, uniqueness scoped to content type
- `@@index([type, status, publishedAt])` — the public listing query
- `@@index([type, pinnedAt, publishedAt])` — homepage ordering
- `@@index([deletedAt])` — restore listing

**Validation rules**

- Publishing requires `title`, `summary`, `body`, `type`, `categoryId`, `coverFileId` (FR-012).
- `slug` is generated from `title`, lowercased, non-alphanumerics collapsed to `-`; on
  collision within the same `type`, a numeric suffix is appended.
- `slug` is not regenerated after first publish (FR-008); an explicit change writes a
  `PostSlugHistory` row.
- `expiresAt` and `attachmentFileId` are rejected for `BERITA` and `ARTIKEL`.
- `body` is sanitized before persistence, never on read.

**State transitions**

```text
                 ┌──────────────── unpublish ─────────────────┐
                 ▼                                            │
  (new) ──▶ DRAFT ──schedule──▶ SCHEDULED ──[time passes]──▶ PUBLISHED
                 │                   │                         │
                 └──── publish ──────┴─────────────────────────▶│
                                                                │
                                                            archive
                                                                ▼
                                                            ARCHIVED
                                                                │
                                                          restore-to-draft
                                                                ▼
                                                              DRAFT

  Any state ──soft delete──▶ deletedAt set ──restore (≤30d)──▶ prior state
```

`PUBLISHED → DRAFT` via unpublish clears `publishedAt` so a later republish is a fresh
publication; `ARCHIVED` retains it, because archiving is filing, not retraction.

---

## 2. PostSlugHistory — *module: `portal/post`*

| Field | Type | Notes |
|---|---|---|
| `id` | `String @id @default(uuid()) @db.Uuid` | |
| `postId` | `String @db.Uuid` | → `Post`, `onDelete: Cascade` |
| `type` | `PostType` | Denormalized so lookup matches the public route shape |
| `slug` | `String @db.VarChar(220)` | |
| `createdAt` | `DateTime @default(now())` | |

`@@unique([type, slug])`. Serves FR-066: a public detail request that misses on `Post.slug`
falls back here and responds `301` to the current address. Applied to Post and PortalPage
only — Agenda and Gallery addresses are not shared at the volume that justifies the table,
and adding it later is a migration, not a redesign.

---

## 3. PostCategory — *module: `portal/taxonomy`*

| Field | Type | Notes |
|---|---|---|
| `id` | `String @id @default(uuid()) @db.Uuid` | |
| `name` | `String @db.VarChar(100)` | |
| `slug` | `String @unique @db.VarChar(120)` | Public filter address |
| `description` | `String? @db.Text` | |
| `isActive` | `Boolean @default(true)` | Deactivate rather than delete (FR-036) |
| `displayOrder` | `Int @default(0)` | |
| `deletedAt` | `DateTime?` | |

FR-037: deletion is refused while any non-deleted `Post` references the category; the error
names the count. Reference-data CRUD, so the frontend side goes through `@241/master-data`
with a per-entity `config.ts` (ADR-0001), not a hand-built list view.

---

## 4. PostTag / PostTagOnPost — *module: `portal/taxonomy`*

`PostTag`: `id`, `name @db.VarChar(60)`, `slug @unique @db.VarChar(80)`, `createdAt`.

`PostTagOnPost`: `postId`, `tagId`, both `@db.Uuid`, `@@unique([postId, tagId])`,
`@@map("portal_post_tags")`. Tags are free-form, created on first use, and shared across
content types (FR-038). Deleting a tag removes its join rows only.

---

## 5. AgendaEntry — *module: `portal/agenda`*

| Field | Type | Notes |
|---|---|---|
| `id` | `String @id @default(uuid()) @db.Uuid` | |
| `title` | `String @db.VarChar(200)` | |
| `slug` | `String @unique @db.VarChar(220)` | |
| `description` | `String @db.Text` | Sanitized HTML |
| `startTime` | `DateTime @db.Timestamptz()` | |
| `endTime` | `DateTime @db.Timestamptz()` | |
| `location` | `String @db.VarChar(200)` | |
| `coverFileId` | `String? @db.Uuid` | → `File` |
| `status` | `ContentStatus @default(DRAFT)` | |
| `publishedAt` | `DateTime?` | |
| `scheduledAt` | `DateTime?` | |
| `authorId` | `String @db.Uuid` | `onDelete: Restrict` |
| `version` | `Int @default(0)` | |
| `createdAt` / `updatedAt` / `deletedAt` | | |

`@@index([status, startTime])`, `@@index([status, endTime])`.

**Validation**: `endTime > startTime`, rejected otherwise (FR-042). `Timestamptz` matches
the existing `Event` model; entry and display are WIB, storage is absolute — an entry
scheduled for 07:00 WIB fires at 07:00 WIB wherever the server runs.

**Upcoming vs past** (FR-040/041) is a read-time predicate, not a stored flag:
`[VISIBLE] AND endTime >= now()` is upcoming, ordered `startTime ASC`; the complement is
past, ordered `startTime DESC`. A multi-day entry stays upcoming for its whole run, which
is the 30-December-to-2-January edge case.

---

## 6. GalleryAlbum — *module: `portal/gallery`*

`id`, `title @db.VarChar(200)`, `slug @unique @db.VarChar(220)`, `description @db.Text?`,
`eventDate @db.Date`, `coverFileId @db.Uuid?`, `status`, `publishedAt`, `scheduledAt`,
`authorId`, `version`, `createdAt`, `updatedAt`, `deletedAt`.

`@@index([status, publishedAt])`, `@@index([status, eventDate])`.

**Validation**: publishing is refused when the album has zero photos (FR-051).

## 7. GalleryPhoto — *module: `portal/gallery`*

| Field | Type | Notes |
|---|---|---|
| `id` | `String @id @default(uuid()) @db.Uuid` | |
| `albumId` | `String @db.Uuid` | → `GalleryAlbum`, `onDelete: Cascade` |
| `fileId` | `String @db.Uuid` | → `File`, `onDelete: Restrict` |
| `caption` | `String? @db.VarChar(300)` | FR-048 |
| `altText` | `String @db.VarChar(300)` | Required (FR-057) |
| `displayOrder` | `Int @default(0)` | FR-048 |

`@@index([albumId, displayOrder])`. Progressive loading (FR-050) is a delivery concern, not
a schema one — the album detail response is paginated and the client lazy-loads.

---

## 8. PortalPage — *module: `portal/page`*

`id`, `title @db.VarChar(200)`, `slug @unique @db.VarChar(220)`, `body @db.Text`
(sanitized), `metaTitle?`, `metaDescription?`, `status`, `publishedAt`, `authorId`,
`version`, `createdAt`, `updatedAt`, `deletedAt`.

Profil, Visi & Misi, Sejarah, Kontak. No category, no tags, no feed placement (FR-052).
Slug changes write `PortalPageSlugHistory` (same shape as model 2, without `type`).

## 9. PortalNavItem — *module: `portal/page`*

| Field | Type | Notes |
|---|---|---|
| `id` | `String @id @default(uuid()) @db.Uuid` | |
| `label` | `String @db.VarChar(60)` | |
| `pageId` | `String? @db.Uuid` | → `PortalPage`, for a page link |
| `routeKey` | `String? @db.VarChar(60)` | For a built-in listing (`berita`, `agenda`, …) |
| `externalUrl` | `String? @db.VarChar(500)` | e.g. the PPDB application (FR-004) |
| `displayOrder` | `Int @default(0)` | |
| `isActive` | `Boolean @default(true)` | |

**Validation**: exactly one of `pageId`, `routeKey`, `externalUrl` is set. An item pointing
at an unpublished page is omitted from the public navigation rather than rendering a link
into a 404 (FR-053).

---

## 10. PortalMediaUsage — *module: `portal/media`*

The table that makes media authorization derivable (research R2).

| Field | Type | Notes |
|---|---|---|
| `id` | `String @id @default(uuid()) @db.Uuid` | |
| `fileId` | `String @db.Uuid` | → `File`, `onDelete: Restrict` |
| `kind` | `MediaUsageKind` | COVER / BODY / ATTACHMENT / ALBUM_PHOTO |
| `postId` | `String? @db.Uuid` | `onDelete: Cascade` |
| `agendaId` | `String? @db.Uuid` | `onDelete: Cascade` |
| `albumId` | `String? @db.Uuid` | `onDelete: Cascade` |
| `pageId` | `String? @db.Uuid` | `onDelete: Cascade` |
| `createdAt` | `DateTime @default(now())` | |

`@@index([fileId])`, plus one index per owner column.

**Validation**: exactly one owner column is set.

**Write path**: rows are recomputed on every content save — explicit `coverFileId` and
`attachmentFileId`, plus every media id parsed out of the sanitized body. Delete-then-insert
inside the same single-module transaction as the content write (Principle VI: same module,
must land together).

**Read path**: `GET /portal/public/media/:fileId` is authorized by
`EXISTS (usage row whose owner satisfies [VISIBLE])`. Unpublishing revokes the images with
no second action. FR-058's "identify the items referencing it" is a join over this table
rather than a scan of every body.

---

## 11. PortalHomepageSection — *module: `portal/homepage`*

| Field | Type | Notes |
|---|---|---|
| `id` | `String @id @default(uuid()) @db.Uuid` | |
| `key` | `String @unique @db.VarChar(40)` | `berita`, `agenda`, `pengumuman`, `galeri` |
| `itemCount` | `Int @default(3)` | FR-029, admin-configurable |
| `isEnabled` | `Boolean @default(true)` | |
| `displayOrder` | `Int @default(0)` | FR-028 |

Seeded with the four sections. This is the only state the homepage module owns; the content
itself is borrowed through `IPostRepository`, `IAgendaRepository`, and `IGalleryRepository`
rather than queried directly (Principle VI).

**Ordering within a section**: `pinnedAt DESC NULLS LAST, publishedAt DESC`, so pinned
items lead and everything else falls back to recency (FR-030).

---

## 12. Existing models touched

| Model | Change | Why |
|---|---|---|
| `AppKey` enum (`app-setting.prisma`) | `+ PORTAL` | Branding, per-app maintenance mode, storage prefix (research R8) |
| `AppSetting` | Seed one `PORTAL` row | Portal branding and metadata, readable pre-login |
| `File` | Back-relations for portal references | Prisma requires the reverse side; no column changes, no behaviour change for other modules |
| `User` | Back-relation for `authorId` | `onDelete: Restrict` on every author FK is what preserves attribution (FR-020) |

`Announcement`, `AnnouncementClassroom`, `Event`, `EventAudience`, and `EventClassroom` are
**not touched**. FR-046 keeps the internal classroom-scoped functions and the public portal
entirely disjoint.

---

## Entity coverage against the spec

| Spec entity | Model(s) |
|---|---|
| Content Item | `Post` |
| Content Type | `PostType` enum + `AgendaEntry` / `GalleryAlbum` / `PortalPage` |
| Category | `PostCategory` |
| Tag | `PostTag`, `PostTagOnPost` |
| Agenda Entry | `AgendaEntry` |
| Gallery Album | `GalleryAlbum`, `GalleryPhoto` |
| Portal Page | `PortalPage` |
| Navigation Item | `PortalNavItem` |
| Homepage Section Configuration | `PortalHomepageSection` + `Post.pinnedAt` |
| Media Asset | Existing `File` + `PortalMediaUsage` |
| Author | Existing `User` via `authorId` |
| Publication Event | Existing `AuditLog` — see note |

**Note on Publication Event (FR-064).** `AuditLog` and `platform/audit-log/` exist as
infrastructure, but the constitution records that nothing in `academic/` currently writes an
audit row, so the system must not be described as audited. FR-064 requires publish,
unpublish, and delete to be recorded, so the portal writes audit rows for those three
actions explicitly. This makes the portal the first module to actually use the audit
infrastructure — worth flagging in tasks so it is built and tested, not assumed.
