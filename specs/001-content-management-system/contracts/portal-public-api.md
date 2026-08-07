# Contract: Portal Public API

**Feature**: `001-content-management-system` | **Date**: 2026-08-06

Every endpoint here is anonymous. All are decorated `@Public()` and throttled, following
the `admission-public.controller.ts` precedent, and all live under the single
`/portal/public/*` prefix so the public surface can be throttled, cached, or fronted by a
CDN as one unit (research R9).

**Response envelope** — the global interceptor wraps every response as
`{ statusCode, message, data, meta? }`. There is no `success` field. Repositories return
`{ data, total, page, limit }` and the interceptor folds it into `data` + `meta`. The
`Returns` column below describes the `data` payload only.

**The visibility rule** — every read applies **[VISIBLE]**
(`deletedAt IS NULL AND status IN (SCHEDULED, PUBLISHED) AND publishedAt <= now()`). No
endpoint here can return a draft, a future-scheduled item, an archived item, or a
soft-deleted one. SC-004 is a claim about this table.

---

## Content reads

| Method | Path | Returns | Notes |
|---|---|---|---|
| `GET` | `/portal/public/homepage` | `HomepageResponseDto` | One round trip: enabled sections in `displayOrder`, each with its configured item count. FR-028, FR-029 |
| `GET` | `/portal/public/posts` | `PaginatedResponse<PostSummaryDto>` | Query: `type` (required: `berita`\|`artikel`\|`pengumuman`), `page`, `limit`, `categorySlug`, `tagSlug`, `q`. FR-021, FR-023, FR-024 |
| `GET` | `/portal/public/posts/:type/:slug` | `PostDetailDto` | Falls back to `PostSlugHistory` → `301` to the current address. FR-022, FR-066 |
| `GET` | `/portal/public/posts/:type/:slug/related` | `PostSummaryDto[]` | Same category first, then recency. Max 4. FR-025 |
| `GET` | `/portal/public/agenda` | `PaginatedResponse<AgendaSummaryDto>` | Query: `scope=upcoming\|past` (default `upcoming`), `page`, `limit`. FR-040 |
| `GET` | `/portal/public/agenda/:slug` | `AgendaDetailDto` | FR-039 |
| `GET` | `/portal/public/albums` | `PaginatedResponse<AlbumSummaryDto>` | Newest `eventDate` first |
| `GET` | `/portal/public/albums/:slug` | `AlbumDetailDto` | Photos paginated for progressive loading. FR-049, FR-050 |
| `GET` | `/portal/public/pages/:slug` | `PageDetailDto` | Falls back to page slug history. FR-052, FR-054 |
| `GET` | `/portal/public/navigation` | `NavItemDto[]` | Active items in `displayOrder`; entries pointing at unpublished pages are omitted. FR-053 |
| `GET` | `/portal/public/categories` | `CategorySummaryDto[]` | Active categories with published counts, for the filter UI |

**Announcement expiry** — `type=pengumuman` listings apply
`expiresAt IS NULL OR expiresAt > now()` when `scope=active` (the default). `scope=archive`
returns expired ones. The detail endpoint ignores expiry entirely: an expired announcement
stays reachable at its own address (FR-044).

---

## Media

| Method | Path | Returns | Notes |
|---|---|---|---|
| `GET` | `/portal/public/media/:fileId` | `302` → signed URL | Authorized by `EXISTS (PortalMediaUsage whose owner satisfies [VISIBLE])`. `404` otherwise — never `403`, which would confirm the file exists. FR-045, research R2 |

This is the **only** public path to a stored file. The URL is stable and permanent, which is
what makes it usable in `og:image` and in a search index; the expiring signed URL stays
behind the redirect. Unpublishing an item makes every image it introduced return `404`
immediately, with no separate revocation step.

---

## Discoverability

| Method | Path | Returns | Notes |
|---|---|---|---|
| `GET` | `/portal/public/meta` | `PageMetaDto` | Query: `path` (a public portal path). Consumed by the backend's own HTML-serving controller, which injects these tags into `index.html` before responding (research R3, Option A). FR-065 |
| `GET` | `/portal/public/media/:fileId?variant=preview` | `302` → signed URL | The 1200×630 JPEG share-preview variant. This is what `og:image` points at — never the original, which is large enough that WhatsApp will drop the image from the card |
| `GET` | `/portal/public/sitemap` | `SitemapEntryDto[]` | Every [VISIBLE] item across all types — posts, agenda, albums, pages — plus the static listing paths, each with its `lastModified`. The JSON form, for tooling. FR-067 |

**Root-level crawler endpoints.** These are not under `/portal/public/` because a search
engine looks for them at the host root, and they are served by `PortalHtmlController`
**before** its `GET *` catch-all — Nest matches in registration order, so a route declared
after the catch-all is never reached.

| Method | Path | Response | Notes |
|---|---|---|---|
| `GET` | `/sitemap.xml` | `application/xml` | The sitemap protocol document a crawler actually consumes: `<urlset>` with absolute `<loc>` values built from `PORTAL_BASE_URL` and XML-escaped. Same entries as `/portal/public/sitemap`. FR-067, SC-014 |
| `GET` | `/robots.txt` | `text/plain` | `Allow: /`, `Disallow: /admin/`, `Disallow: /login`, and an absolute `Sitemap:` line. SC-014 |

`PageMetaDto`: `{ title, description, canonicalUrl, imageUrl, type, publishedAt }`.
`imageUrl` is always a `/portal/public/media/:fileId` address, never a signed URL — a
crawler caching an expiring URL is the failure mode research R2 exists to prevent.

`GET /portal/public/meta` returns `404` for a path that resolves to nothing public, so the
injection layer falls through to the portal's default metadata rather than inventing any.

---

## Behavioural contract

**Not found is uniform.** Unknown address, draft, scheduled-but-not-yet-due, archived, and
soft-deleted all return the same `404` with the same body. Nothing distinguishes "no such
item" from "not published yet" (FR-022, FR-026). This includes the media endpoint.

**Throttling.** The `/portal/public/*` prefix carries a throttle bucket separate from
`auth`. Exceeding it returns `429`; it must never degrade SIAKAD, inventory, or PPDB
(FR-027, SC-012).

**Caching.** List, detail, homepage, navigation, and sitemap responses are cached in the
existing `AppCacheModule` with a short TTL, invalidated on publish, unpublish, update of a
published item, and delete. The media redirect is not cached server-side; the signed URL
must be minted fresh.

**Availability.** These endpoints are unaffected by SIAKAD's maintenance mode, because
maintenance is a per-`AppKey` setting and the portal has its own key (research R8). FR-003
and SC-006 are structural, not a runtime check anyone has to remember.

**Time.** All timestamps serialize as ISO-8601 with offset. Display in WIB is the client's
responsibility; the API never sends a naive local time.
