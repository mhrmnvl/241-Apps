# 241-Apps

Shared vocabulary for concepts that cut across `academic`, `inventory`, `admission`, and `portal` — not domain-specific to any one app.

## Language

**Master Data**:
A simple reference/lookup entity (e.g. religion, blood type, education level, occupation) — admin-managed via basic CRUD, referenced by ID from other domains, with no business logic of its own.
_Avoid_: Lookup table, reference data, master table

**Field Descriptor**:
A data-driven declaration (key, kind, label, validation rules) that generates a Master Data entity's table column, form field, and validation schema from one source of truth.
_Avoid_: Column definition, form field config

**Config Adapter**:
The per-entity object (`config.ts`) that implements `MasterDataConfig<T>`, wiring an entity's existing service, permissions, and field descriptors into the shared Master Data engine.
_Avoid_: Controller, view model, entity service

**readOnlyOnEdit**:
A field-descriptor property marking a field as settable only at creation — rendered disabled on edit and dropped from the update payload.
_Avoid_: Immutable field, locked field

## Portal

Terms specific to the public school website (`apps/portal`, `backend/src/portal`).
Listed here rather than in the app because several already have near-homonyms
elsewhere in the workspace, and telling them apart is the point.

**Visibility predicate**:
The one definition of "a visitor can see this" — `deletedAt IS NULL AND status IN (SCHEDULED, PUBLISHED) AND publishedAt <= now()`. Held in a `*.where.ts` per model and composed by every public query, the homepage aggregator, the sitemap, and the media authorization check. Public visibility is derived at read time; it is never a stored flag.
_Avoid_: isPublished, published flag, visible column

**Content item**:
A `Post` row — Berita, Artikel, or Pengumuman, discriminated by `type`. Agenda entries, gallery albums, and pages are separate models with their own lifecycles, not content items.
_Avoid_: Article, entry, node

**Portal Pengumuman**:
A public announcement published by the portal's operators. Wholly disjoint from SIAKAD's `Announcement`, which is classroom-scoped and internal (FR-046) — different table, different lifecycle, different permissions. The two must never be joined or merged.
_Avoid_: Announcement (unqualified)

**Portal Agenda**:
A public school activity with a start and end time. Disjoint from SIAKAD's `Event` for the same reasons as above. Upcoming vs past is a read-time comparison on `endTime`, so a multi-day activity stays upcoming for its whole run.
_Avoid_: Event, calendar entry

**Media usage**:
A `PortalMediaUsage` row recording that one content item references one stored file. Media authorization is derived from these: a file is publicly fetchable exactly while some currently-visible item references it, so unpublishing revokes its images with no separate step.
_Avoid_: Attachment record, file link, public flag

**Public media address**:
The stable `/portal/public/media/:fileId` URL. The only public path to a stored file, and the only thing that may appear in content, an `og:image`, or a search index — the expiring signed URL stays behind a redirect. A signed URL written into content works in testing and dies days later.
_Avoid_: File URL, signed URL, download link

**Share-preview variant**:
The 1200×630 JPEG generated at upload time and served as `?variant=preview`. What `og:image` points at, because link-preview crawlers drop images that are too large and render a card with no picture at all.
_Avoid_: Thumbnail, og image

**Slug history**:
A `PostSlugHistory` / `PortalPageSlugHistory` row holding an address an item used to answer to. A detail request that misses on the live slug falls back here and responds `301`, so links already shared on WhatsApp keep working after a rename.
_Avoid_: Redirect table, alias

**Portal operator**:
Someone holding `portal-*` permissions — typically the `PORTAL_EDITOR` role. Deliberately not the same person as a SIAKAD administrator: `ADMIN`'s blanket permission bypass stops at `portal-*` (ADR-0006), while `SUPER_ADMIN` retains it as break-glass.
_Avoid_: Admin, content admin
