# Contract: Portal Admin API

**Feature**: `001-content-management-system` | **Date**: 2026-08-06

Every endpoint here requires a valid session (`JwtAuthGuard`) and an explicit permission
(`@RequirePermissions(...)`). None is `@Public()`. Permission codes are listed in
[permissions.md](./permissions.md).

**Envelope** — the global interceptor wraps responses as
`{ statusCode, message, data, meta? }`; list endpoints return `PaginatedResponse<T>` and
the interceptor folds `{ data, total, page, limit }` into `data` + `meta`. The `Returns`
column describes the `data` payload.

**Concurrency** — every update and every state transition takes the `version` the client
loaded. A mismatch returns `409 Conflict` rather than overwriting (FR-013, research R5).

---

## Posts — Berita, Artikel, Pengumuman

| Method | Path | Permission | Returns |
|---|---|---|---|
| `GET` | `/portal/posts` | `portal-posts.read` | `PaginatedResponse<PostAdminSummaryDto>` — query: `type`, `status`, `categoryId`, `q`, `page`, `limit`, `includeDeleted` |
| `GET` | `/portal/posts/:id` | `portal-posts.read` | `PostAdminDetailDto` |
| `POST` | `/portal/posts` | `portal-posts.create` | `PostAdminDetailDto` — always created as `DRAFT` |
| `PATCH` | `/portal/posts/:id` | `portal-posts.update` | `PostAdminDetailDto` |
| `POST` | `/portal/posts/:id/publish` | `portal-posts.publish` | `PostAdminDetailDto` — body: `{ version, scheduledAt? }` |
| `POST` | `/portal/posts/:id/unpublish` | `portal-posts.publish` | `PostAdminDetailDto` |
| `POST` | `/portal/posts/:id/archive` | `portal-posts.publish` | `PostAdminDetailDto` |
| `POST` | `/portal/posts/:id/pin` | `portal-posts.publish` | `PostAdminDetailDto` — body: `{ version, pinned: boolean }` |
| `DELETE` | `/portal/posts/:id` | `portal-posts.delete` | `204` — soft delete |
| `POST` | `/portal/posts/:id/restore` | `portal-posts.delete` | `PostAdminDetailDto` — within 30 days |
| `GET` | `/portal/posts/:id/preview` | `portal-posts.read` | `PostDetailDto` — renders exactly as the public detail page (FR-011) |

**`publish` is a distinct permission from `create` and `update`** (FR-059). It also governs
unpublish, archive, and pin — all of them change what the public sees, which is the
boundary the permission is drawing.

**Publish semantics**: with no `scheduledAt`, `publishedAt` is set to now and `status`
becomes `PUBLISHED`. With a future `scheduledAt`, `publishedAt` is set to that moment and
`status` becomes `SCHEDULED` — the item then becomes public on time regardless of the
normalizing cron (research R1). A `scheduledAt` in the past is rejected `400`.

**Publish validation**: `title`, `summary`, `body`, `type`, `categoryId`, `coverFileId`
must all be present, and every image must carry alt text; otherwise `422` naming the
missing fields (FR-012, FR-057). Draft saves skip all of it.

---

## Agenda

| Method | Path | Permission |
|---|---|---|
| `GET` | `/portal/agenda` | `portal-agendas.read` |
| `GET` | `/portal/agenda/:id` | `portal-agendas.read` |
| `POST` | `/portal/agenda` | `portal-agendas.create` |
| `PATCH` | `/portal/agenda/:id` | `portal-agendas.update` |
| `POST` | `/portal/agenda/:id/publish` \| `/unpublish` \| `/archive` | `portal-agendas.publish` |
| `DELETE` | `/portal/agenda/:id` | `portal-agendas.delete` |
| `POST` | `/portal/agenda/:id/restore` | `portal-agendas.delete` |

`endTime <= startTime` returns `400` (FR-042).

## Albums

| Method | Path | Permission |
|---|---|---|
| `GET` | `/portal/albums` | `portal-albums.read` |
| `GET` | `/portal/albums/:id` | `portal-albums.read` |
| `POST` | `/portal/albums` | `portal-albums.create` |
| `PATCH` | `/portal/albums/:id` | `portal-albums.update` |
| `POST` | `/portal/albums/:id/photos` | `portal-albums.update` — body: `{ fileId, altText, caption? }` |
| `PATCH` | `/portal/albums/:id/photos/order` | `portal-albums.update` — body: `{ photoIds: string[] }` (FR-048) |
| `DELETE` | `/portal/albums/:id/photos/:photoId` | `portal-albums.update` |
| `POST` | `/portal/albums/:id/publish` \| `/unpublish` \| `/archive` | `portal-albums.publish` |
| `DELETE` | `/portal/albums/:id` | `portal-albums.delete` |

Publishing an album with zero photos returns `422` (FR-051).

## Pages and navigation

| Method | Path | Permission |
|---|---|---|
| `GET` \| `POST` | `/portal/pages` | `portal-pages.read` \| `.create` |
| `GET` \| `PATCH` \| `DELETE` | `/portal/pages/:id` | `portal-pages.read` \| `.update` \| `.delete` |
| `POST` | `/portal/pages/:id/publish` \| `/unpublish` | `portal-pages.publish` |
| `GET` \| `POST` | `/portal/navigation` | `portal-pages.read` \| `.update` |
| `PATCH` \| `DELETE` | `/portal/navigation/:id` | `portal-pages.update` |
| `PATCH` | `/portal/navigation/order` | `portal-pages.update` — body: `{ itemIds: string[] }` (FR-053) |

A nav item with zero or more than one of `pageId` / `routeKey` / `externalUrl` returns `400`.

## Taxonomy

| Method | Path | Permission |
|---|---|---|
| `GET` \| `POST` | `/portal/categories` | `portal-categories.read` \| `.create` |
| `PATCH` \| `DELETE` | `/portal/categories/:id` | `portal-categories.update` \| `.delete` |
| `GET` \| `POST` | `/portal/tags` | `portal-tags.read` \| `.create` |
| `PATCH` \| `DELETE` | `/portal/tags/:id` | `portal-tags.update` \| `.delete` |

Deleting a category still referenced by non-deleted posts returns `409` with the count and
a sample of affected titles (FR-037). Both are reference data, so the frontend consumes
these through `@241/master-data` with a per-entity `config.ts` (ADR-0001) rather than a
hand-built list view.

## Homepage configuration

| Method | Path | Permission |
|---|---|---|
| `GET` | `/portal/homepage/sections` | `portal-settings.read` |
| `PATCH` | `/portal/homepage/sections/:key` | `portal-settings.update` — body: `{ itemCount, isEnabled, displayOrder }` |

`itemCount` is bounded `1..12`; outside that returns `400` (FR-029).

## Media

| Method | Path | Permission | Notes |
|---|---|---|---|
| `GET` | `/portal/media` | `portal-posts.read` | The picker's library — existing uploads under the `PORTAL` app key, so an editor reuses rather than re-uploads (FR-055) |
| `GET` | `/portal/media/:fileId/usage` | `portal-posts.read` | Which items reference this file (FR-058) |

**Upload reuses the existing endpoint**: `POST /files/upload?appKey=PORTAL` with
`files.create`. `upload-file.use-case.ts` already enforces the 10 MB cap, validates by magic
bytes rather than the client-supplied MIME type, and optimizes images through `sharp` —
FR-056 is satisfied by existing behaviour, and duplicating an upload path would give the
portal a second, weaker validator.

**Deletion** goes through `DELETE /files/:id` with `files.delete`, which gains a
portal-usage check: `409` when `PortalMediaUsage` rows exist, listing the referencing items
(FR-040, FR-058).

---

## Cross-cutting

**Sanitization.** Every `body` and `description` is sanitized server-side on write and
stored sanitized (FR-010, research R6). The public read path does no sanitization work — a
sanitizer on the read path would be both slower and a second place for the policy to drift.

**Media usage.** Every content write recomputes `PortalMediaUsage` for that item —
delete-then-insert inside the same single-module transaction as the content write. This is
the only transaction in the feature, and it does not cross a module boundary (ADR-0003).

**Audit.** Publish, unpublish, and delete write an `AuditLog` row naming the actor, the
item, and the time (FR-064). The portal is the first module to actually write audit rows,
so this needs building and testing rather than assuming.

**Attribution.** `authorId` is set on create and never reassigned. Author FKs are
`onDelete: Restrict`, so a user row backing published content cannot be hard-deleted and
attribution survives deactivation or loss of permissions (FR-020).

**Errors.** NestJS HTTP exceptions only — `NotFoundException`, `ConflictException`,
`BadRequestException`, `UnprocessableEntityException`. No bare `throw new Error()`.
