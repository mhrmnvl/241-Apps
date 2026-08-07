# Quickstart: Validating the School Portal & CMS

**Feature**: `001-content-management-system` | **Date**: 2026-08-06

Runnable scenarios that prove the feature works end to end. Each maps to a spec success
criterion. Run them in order — later scenarios assume the data earlier ones create.

Details live elsewhere and are referenced, not repeated: model shapes in
[data-model.md](./data-model.md), endpoints in [contracts/](./contracts/), design rationale
in [research.md](./research.md).

---

## Prerequisites

```bash
pnpm install                                  # links the new apps/portal workspace
pnpm --filter backend prisma:generate
pnpm --filter backend prisma:migrate          # portal.prisma + AppKey.PORTAL
pnpm --filter backend dev                     # http://localhost:3000
pnpm --filter portal-web dev                  # http://localhost:5176
```

Seed requirements: a `PORTAL` row in `app_settings`, the four `PortalHomepageSection` rows,
at least one `PostCategory`, a `PORTAL_EDITOR` role holding the 30 codes in
[permissions.md](./contracts/permissions.md), and one user with only that role.

Use a **signed-out private window** for every step described as "as a visitor". A stale
session is the most common way these scenarios pass while the feature is broken.

---

## Scenario 1 — Publish a news item and see it live (US1, SC-001, SC-002, SC-003)

1. Sign in to `http://localhost:5176/admin` as the `PORTAL_EDITOR` user.
2. Create a Berita: title, summary, body with one embedded image, cover image with alt
   text, category. Save as draft.
3. As a visitor, load `http://localhost:5176/` — **the item must not appear.**
4. As a visitor, guess its address `/berita/<slug>` — **`404`, and the response must be
   byte-identical to a genuinely unknown slug.**
5. Publish it. Reload the homepage as a visitor — the item appears with title, summary,
   cover image, and date.
6. Publish three more. The homepage shows the configured count (default 3), newest first.
7. `PATCH /portal/homepage/sections/berita` with `itemCount: 5`. Reload — five items, **no
   rebuild, no deploy** (SC-002).

**Passes when**: steps 3 and 4 show nothing and step 5 needs no deployment.

---

## Scenario 2 — Read, browse, and share (US2, US7, SC-008, SC-009, SC-013)

1. As a visitor, click a headline on the homepage → full detail in **one click** (SC-008).
2. Paginate `/berita` past the first page; each page has its own address.
3. Copy the detail address into a fresh window → renders fully.
4. Edit the published item's title **and** its slug in the management area.
5. Open the **original** address → resolves via slug history with `301` (FR-066, SC-009).
6. `curl "http://localhost:3000/portal/public/meta?path=/berita/<new-slug>"` → title,
   description, canonical URL, and an `imageUrl` pointing at
   `/portal/public/media/:fileId` — **never a signed S3 URL** (research R2).
7. Paste the public address into a link-preview checker → title, summary, and image.

**Step 7 requires the injection layer from research R3.** Without it the preview is a bare
URL — that is the expected failure before Phase D, not a bug in the API. Step 6 is the part
that must pass on the backend alone.

---

## Scenario 3 — Operator separation (US3, SC-005, SC-006)

The scenario most worth automating, because failing it is a data-exposure problem.

1. As the `PORTAL_EDITOR`, confirm publishing works.
2. As the same user, call an academic endpoint (e.g. `GET /students`) → **`403`**. Repeat
   for teachers, grades, assets, and applicants (SC-005).
3. Sign in as a user with full academic permissions but **no** `portal-*` codes. Open
   `/admin` on the portal → refused, and no management entries are visible (FR-063).
4. Sign in as an `ADMIN` (not `SUPER_ADMIN`) holding no `portal-*` codes.
   `POST /portal/posts/:id/publish` → **`403`.** This is the ADR-0006 change; before it, the
   blanket bypass returns `200` (see [permissions.md](./contracts/permissions.md)).
5. As `SUPER_ADMIN`, the same call → `200` (break-glass, deliberate).
6. Revoke the editor's `portal-posts.publish`. Their next publish → `403`, while their
   already-published items stay public and stay attributed to them (FR-020).
7. Set `maintenanceMode: true` on the **ACADEMIC** app key. As a visitor, reload the portal
   homepage → **still readable** (SC-006).

**Passes when**: steps 2, 3, 4, and 6 all refuse, and step 7 still serves.

---

## Scenario 4 — Lifecycle and concurrency (US4, SC-011)

1. Create a draft; schedule it for **two minutes ahead**. As a visitor → not visible.
2. Wait past the moment and reload as a visitor → **visible**.
3. Now stop the backend, set another item's `scheduledAt` to one minute ahead directly in
   the database, restart after the moment passes, and load it as a visitor → **visible
   immediately**, without waiting for a cron tick. This is the whole point of research R1;
   if it fails, visibility has been implemented as a stored flag.
4. Edit a published item → public version updates, `publishedAt` unchanged, `updatedAt`
   moves (FR-018).
5. Open one item in two browser tabs. Save in tab A, then save in tab B → **`409`**, tab B
   is told the item changed, and tab A's edit survives (FR-013).
6. Unpublish → gone from homepage and its address `404`s.
7. Delete, then restore from the deleted list → returns to its prior state (SC-011).
8. Confirm `AuditLog` rows exist for the publish, unpublish, and delete (FR-064).

---

## Scenario 5 — Media authorization (US6, FR-058, research R2)

The scenario that catches the subtlest failure in the design.

1. Upload an image via `POST /files/upload?appKey=PORTAL`.
2. As a visitor, `GET /portal/public/media/:fileId` → **`404`** (uploaded but unreferenced).
3. Attach it as a cover to a **draft** post. As a visitor → still **`404`**.
4. Publish the post. As a visitor → **`302`** to a signed URL that resolves to the image.
5. Unpublish the post. As a visitor → **`404` again**, with no separate revocation step.
6. Republish, then `DELETE /files/:id` → **`409`**, listing the referencing items (FR-058).
7. `GET /portal/media/:fileId/usage` → the referencing items.
8. Upload a 12 MB file → rejected naming the 10 MB limit. Upload a `.exe` renamed `.jpg` →
   rejected on magic bytes, not the extension (FR-056, existing behaviour).
9. Save a post with an image lacking alt text → prompted; publishing is refused (FR-057).

**Passes when**: steps 2, 3, and 5 all `404` without anyone flagging the file.

---

## Scenario 6 — Sanitization (FR-010)

1. As an editor, paste `<script>alert(1)</script>` and an `onerror=` image into a body. Save
   and publish.
2. Read it back from `GET /portal/public/posts/berita/<slug>` → **the stored body contains
   neither.** Sanitization happens on write, so the stored row is already clean.
3. View the public page → nothing executes.
4. `POST /portal/posts` directly via `curl` with the same payload, bypassing the editor →
   **still sanitized.** If this step passes only through the UI, sanitization is on the
   wrong side of the trust boundary (research R6).

---

## Scenario 7 — Remaining content types (US8–US11)

**Agenda**: create entries dated past and future; homepage shows nearest upcoming ascending;
a past entry leaves the upcoming view but stays at its address; an entry spanning
30 Dec – 2 Jan stays upcoming for its whole run; `endTime < startTime` → `400`.

**Pengumuman**: publish with an attachment and an expiry two minutes out. As a visitor,
download the attachment **without signing in**. After expiry, it leaves the active list but
stays at its address (FR-044). Confirm an internal classroom announcement in SIAKAD does
**not** appear on the portal (FR-046).

**Galeri**: create an album, publish with zero photos → `422`. Add photos, reorder, publish
→ visitor browses and opens full size; 50 photos usable within 3s on a throttled connection
(SC-015).

**Halaman**: publish a "Profil Madrasah" page, add it to navigation, reorder → public
navigation reflects the order. Unpublish → `404`, and the nav entry disappears rather than
linking into a dead page.

---

## Gate checks

```bash
pnpm --filter portal-web validate     # format:check + lint + typecheck + lint:strict + build
pnpm --filter backend validate        # ...+ test + build
pnpm typecheck && pnpm test           # confirms portal-web is picked up by the *-web filter
pnpm build
```

`pnpm typecheck` is the one that matters most on a new app: if `portal-web` were misnamed,
the root `--filter "*-web"` scripts would silently skip it and stay green while checking
nothing. Confirm the portal actually appears in the output — a green run that executed
nothing is the most expensive failure mode available in this repository.

### Automated: the unpublished-access sweep (SC-004)

```bash
pnpm --filter backend test:e2e        # includes portal-public-visibility.e2e-spec.ts
```

107 assertions over every content type × every unpublished state × every public
surface, plus a control proving a published item *is* visible. This is the automated
form of SC-004 and replaces the manual sweep the coverage map below used to defer.

It caught two real defects on its first run, which is the argument for having written
it: the public detail route passed the lowercase URL segment straight to Prisma as an
enum (a 500, not a 404), and `PortalHtmlController`'s `GET *` catch-all was registered
ahead of the agenda, gallery, and page controllers, making those endpoints unreachable.

### Recorded run — 2026-08-07

Environment: dev build (`nest start --watch`) on a developer laptop against a remote
Neon Postgres. **Not the deployment**, so these numbers bound the code's behaviour
rather than predicting a visitor's experience.

| Check | Result |
|---|---|
| Backend unit suite | 520 passed (265 in `src/portal`) |
| Backend e2e | 107 passed |
| `portal-web` vitest | 25 passed |
| Public surface, concurrency 20 | ~860 req/s, p50 18 ms, p95 44 ms, p99 61 ms |
| `/health` sampled mid-load | 200 in 247 ms — SIAKAD-facing routes unaffected (SC-012) |
| SC-006: `ACADEMIC.maintenanceMode = true` | every `/portal/public/*` endpoint still 200 |
| Anonymous-surface probes (Scenarios 2, 5, 6 curl checks) | 9/9 passed |

**One thing the run surfaced that is a deployment step, not a defect.** The homepage
returned zero sections and there is no `PORTAL` row in `app_settings`, because the seed
has not been run against this database since `AppKey.PORTAL` and the portal seed were
added. Run `pnpm --filter backend exec tsx prisma/seed.ts` (or the portal seed alone)
before the walkthrough, or Scenario 1 will show an empty homepage for a reason that has
nothing to do with the content just published.

**What the load run actually established.** The application layer was never the
constraint — the throttle was. At ~860 req/s the portal bucket returned `429` for 727
of 6,900 requests, and nothing else pushed back. That reframed the limit as the number
worth getting right, and it was too low: the unit of consumption is an *image*, not a
visitor. One 24-photo album costs 25 requests, and a class of thirty opening it arrives
from a single NAT address — roughly 750 requests in a burst, against a 300/min
production limit. The default was raised to 2,000/min with that arithmetic recorded in
`app.module.ts`.

**What it did not establish.** SC-007 (main text painted within 2.5 s on 4G) is a
front-end delivery measurement and needs a throttled browser profile against a
production build behind the real network — not a local API benchmark. SC-010
(management search over 500 items) needs a dataset of that size; the seed does not
provide one. Both remain open, and are listed as such below rather than quietly
counted as passed.

---

## Coverage map

| Scenario | Stories | Success criteria |
|---|---|---|
| 1 | US1 | SC-001, SC-002, SC-003 |
| 2 | US2, US7 | SC-008, SC-009, SC-013, SC-014 |
| 3 | US3 | SC-005, SC-006 |
| 4 | US4 | SC-011 |
| 5 | US6 | — (FR-055–058) |
| 6 | — | — (FR-010) |
| 7 | US8–US11 | SC-015 |

**Not covered by manual walkthrough**, and needing measurement rather than clicking:

- **SC-004** — now automated as `backend/test/portal-public-visibility.e2e-spec.ts`.
- **SC-012** — exercised by the recorded run above: the public surface saturating its
  own throttle bucket left `/health` responding normally.
- **SC-007** (2.5 s to main text on 4G) — still open. Needs a throttled browser profile
  against a production build, not an API benchmark.
- **SC-010** (management search over 500 items) — still open. Needs a seeded dataset of
  that size, which the current seed does not produce.
