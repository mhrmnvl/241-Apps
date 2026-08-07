# Feature Specification: School Portal & Content Management System

**Feature Branch**: `001-content-management-system`

**Created**: 2026-08-06

**Status**: Implemented (2026-08-07) — see `tasks.md` (T001–T159) and branch
`feat/portal-content-management-system`

**Input**: User description: "Saya mau membuat Content Management System dimana nanti akan ditampilkan di landing page sebagian, sehingga datanya dinamis, cms ini terdiri dari berita, artikel dll yang best practice, boleh direkomendasikan ke saya ya"

**Clarified**: 2026-08-06 — three scope questions resolved by the requester:

1. Public content lives in a **new dedicated portal application (`portal-web`)** — the school's own website, deliberately separate from the PPDB/admission application, built for the long term.
2. **Full content type set** is in scope: Berita, Artikel, Pengumuman, Agenda, Galeri, and Halaman statis.
3. The CMS owns **its own public Pengumuman and Agenda**, managed inside the portal and separate from the existing internal classroom announcement and event functions — because the people operating the portal may not be the people operating SIAKAD.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Publish a news item and see it on the portal homepage (Priority: P1)

A staff member responsible for school communications signs in to the school portal, writes a news item (title, short summary, body, cover photo), and publishes it. Within moments the item appears in the "Berita Terbaru" section of the portal's public homepage, ahead of the previously newest item. No developer is involved and nothing is deployed.

**Why this priority**: This is the entire premise of the request — the homepage stops being hardcoded and starts reflecting real school activity. Delivered alone, the school has a public website with living content, which is more than it has today.

**Independent Test**: Sign in to the portal as a content editor, create one news item, publish it, open the portal homepage in a signed-out browser, and confirm the item appears with its title, summary, cover image, and date. Confirm a draft created in the same session does not appear.

**Acceptance Scenarios**:

1. **Given** an editor signed in with permission to publish, **When** they create a news item with all required fields and publish it, **Then** the item becomes visible on the public portal homepage without any code change or deployment.
2. **Given** a news item saved as a draft, **When** an anonymous visitor loads the homepage or guesses the item's public address, **Then** the item is not visible and its existence is not revealed.
3. **Given** four published news items exist, **When** an anonymous visitor loads a homepage configured to highlight three, **Then** the three most recently published items are shown, newest first.
4. **Given** no news item has ever been published, **When** an anonymous visitor loads the homepage, **Then** the page renders correctly with the news section hidden or showing a neutral empty state — never a broken layout or an error.
5. **Given** a published news item, **When** an editor unpublishes it, **Then** it disappears from the homepage and its public address stops serving the content.

---

### User Story 2 - Visitors browse and read the full content (Priority: P2)

An anonymous visitor — a prospective parent, an alumnus, a current parent — clicks a headline on the homepage and reads the full item on its own page at a stable, shareable address. From there they reach a complete, paginated listing of all published news and articles, and jump between related items.

**Why this priority**: Homepage highlights are a teaser. Without somewhere to click through to, the highlights are a dead end and the content investment is wasted. This is the increment that makes the portal worth writing for.

**Independent Test**: With several published items present, open the public listing as an anonymous visitor, page through it, open an item's detail page by pasting its address into a fresh browser, and confirm the full body, cover image, author, and publish date render.

**Acceptance Scenarios**:

1. **Given** a published item, **When** an anonymous visitor opens its public address directly, **Then** the full title, summary, body, cover image, publish date, author attribution, and category are displayed.
2. **Given** more published items exist than fit on one page, **When** a visitor reaches the end of the listing, **Then** they can advance to older items and return, and each page is reachable by its own address.
3. **Given** a visitor opens an address for an item that never existed, was deleted, or is still a draft, **When** the page loads, **Then** a clear "not found" page is shown that does not distinguish between the three cases.
4. **Given** a visitor is reading an item, **When** they reach the end, **Then** other published items are suggested so they can continue reading.

---

### User Story 3 - The portal is operated independently from SIAKAD (Priority: P3)

The school's humas team is given accounts that let them run the portal — write, publish, upload photos, edit the school profile pages — and nothing else. They cannot see student records, grades, or staff data. Conversely, a SIAKAD administrator does not gain the ability to publish to the school's public website merely by being a SIAKAD administrator.

**Why this priority**: The requester stated it directly: the people holding the portal may differ from the people holding SIAKAD. Getting this wrong is not a feature gap but a data-exposure problem, and retrofitting a permission split after accounts have been handed out is far harder than building it in. It sits at P3 rather than P1 only because the MVP can be demonstrated with an existing administrator account.

**Independent Test**: Create an account holding only portal content permissions. Confirm it can sign in to the portal, write and publish content, and that every attempt to reach student, grade, or staff data is refused. Then take an account with full academic permissions but no content permissions and confirm it cannot publish to the portal or see content management screens.

**Acceptance Scenarios**:

1. **Given** a staff member holding only portal content permissions, **When** they sign in, **Then** they can manage and publish content, and no academic or personnel data is reachable to them.
2. **Given** a SIAKAD administrator without content permissions, **When** they open the portal's management area, **Then** they are refused and see no content management entries.
3. **Given** a staff member's content permissions are revoked, **When** they next attempt to publish, **Then** the action is refused, while content they published previously stays public and stays attributed to them.
4. **Given** the portal is operated by a separate team, **When** SIAKAD is placed in maintenance mode, **Then** the public portal remains readable to visitors.

---

### User Story 4 - Manage the editorial lifecycle (Priority: P4)

An editor works on an item over several days as a draft, schedules it to go public on the morning of the event, corrects a typo after publication, temporarily unpublishes an item that turned out to be wrong, and archives last year's items so the working list stays manageable. If someone deletes the wrong item, it can be restored.

**Why this priority**: Without lifecycle control, editors publish half-finished work or lose it. A school's content calendar is genuinely date-driven — the notice for a Monday event is written the preceding Friday. This is what turns a working feature into one people trust.

**Independent Test**: Create an item, save it as a draft, schedule it for a future time, confirm it is not public before that time and becomes public after; then unpublish, archive, delete, and restore it — verifying public visibility at every step.

**Acceptance Scenarios**:

1. **Given** a draft item, **When** the editor schedules it for a future date and time, **Then** it stays invisible to the public until that moment and becomes visible automatically afterwards without anyone signing in.
2. **Given** a published item, **When** an editor edits and saves it, **Then** the public version updates, the original publish date is preserved, and the last-edited time is recorded separately.
3. **Given** two editors open the same item, **When** the second saves over changes they never saw, **Then** the system prevents the silent overwrite and tells them the item changed.
4. **Given** an item deleted by mistake, **When** an editor with the right permission looks in deleted items within the retention window, **Then** they can restore it to its previous state.
5. **Given** any publish, unpublish, or delete action, **When** it completes, **Then** the acting user and the time are recorded and can be reviewed later.

---

### User Story 5 - Organize content by type, category, and tag (Priority: P5)

Content is not one undifferentiated stream. A report on a student competition win is *Berita*; a teacher's piece on adolescent literacy is an *Artikel*. Each has its own public listing. Within those, editors file items under categories (Prestasi, Kegiatan, Akademik, Keagamaan) and attach free-form tags, and visitors filter or search on both.

**Why this priority**: Useful once there is enough content to need sorting — roughly after a few dozen items. Before that it is overhead. It matters for the long run because retrofitting a taxonomy onto hundreds of untagged items is painful.

**Independent Test**: Create categories, assign items of both content types to them, then as an anonymous visitor filter the public listing by category and by tag and confirm only matching published items appear.

**Acceptance Scenarios**:

1. **Given** items of both content types exist, **When** a visitor opens the Berita listing, **Then** only Berita appear; the Artikel listing likewise shows only Artikel.
2. **Given** categories exist, **When** an editor assigns one and a visitor filters by it, **Then** only published items in that category are listed.
3. **Given** a category in use by existing content, **When** an admin tries to delete it, **Then** the deletion is refused or reassignment is required first.
4. **Given** a visitor types a phrase into the portal search, **When** results return, **Then** only published items matching in title or summary are listed.

---

### User Story 6 - Manage images and media centrally (Priority: P6)

An editor uploads a photo once and reuses it as a cover image and inside the body of several items. Oversized or wrong-format files are rejected with a clear message. Every image carries alternative text. A file still used by published content cannot be deleted out from under it.

**Why this priority**: A school portal is photo-heavy by nature — every event produces images. Re-uploading the same file per item wastes storage and makes cleanup impossible. It sits here because the earlier stories can ship with a single cover image per item, but the gallery story (P11) is unworkable without it.

**Independent Test**: Upload an image, attach it as a cover to two items and inside the body of a third, attempt to delete it and confirm refusal. Attempt an over-size file and a disallowed type and confirm both are rejected with readable messages.

**Acceptance Scenarios**:

1. **Given** an editor is composing an item, **When** they choose a cover image, **Then** they can upload a new file or pick a previously uploaded one.
2. **Given** a file exceeds the size limit or is not a permitted image type, **When** it is uploaded, **Then** it is rejected with a message naming the limit or accepted formats.
3. **Given** an image used by a published item, **When** someone attempts to delete it, **Then** deletion is refused and the items using it are identified.
4. **Given** an image attached to an item, **When** the editor saves without alternative text, **Then** they are prompted to supply it.

---

### User Story 7 - Content is findable and shareable outside the portal (Priority: P7)

When a parent shares a portal address in a WhatsApp group, the message expands into a card with the headline, summary, and cover photo rather than a bare link. Search engines discover and index every published item, and an address keeps working after its title is edited.

**Why this priority**: For a school, WhatsApp sharing and search visibility are the two real distribution channels — far more than direct visits. It ranks here rather than earlier only because it is worthless until there is content worth sharing.

**Independent Test**: Publish an item, paste its address into a link-preview checker and into a chat application, and confirm headline, summary, and image appear. Confirm the machine-readable address list includes it and excludes drafts. Edit the title of a published item and confirm the original address still resolves.

**Acceptance Scenarios**:

1. **Given** a published item, **When** its address is shared on a social or chat platform, **Then** the preview shows the title, summary, and cover image.
2. **Given** published content exists, **When** a search engine requests the portal's machine-readable address list, **Then** every Published item is listed and no Draft, Scheduled, Archived, or deleted item appears.
3. **Given** a published item whose title is later edited, **When** a visitor opens the address shared before the edit, **Then** they still reach the item.
4. **Given** an editor wants a headline to read differently in search results, **When** they set a separate search title and description, **Then** those are used for search and sharing while the on-page headline is unchanged.

---

### User Story 8 - Maintain the school's information pages and portal navigation (Priority: P8)

Pages that rarely change but must never be wrong — Profil Madrasah, Visi & Misi, Sejarah, Ekstrakurikuler, Kontak — are edited by portal staff through the same editor as news. Staff also decide which pages appear in the portal's navigation menu and in what order.

**Why this priority**: High value per edit, very low edit frequency. Deferring it costs an occasional developer request, which is survivable in a way that a static homepage is not. Navigation control is bundled here because a page nobody can reach is not published.

**Independent Test**: Create an informational page, publish it, add it to the navigation menu, open it as an anonymous visitor at its own address, edit its body, and confirm the public page reflects the change without a deployment.

**Acceptance Scenarios**:

1. **Given** a staff member with page permissions, **When** they create and publish an informational page, **Then** it is reachable at its own public address.
2. **Given** a published page, **When** its body is edited and saved, **Then** the public version reflects the change without any deployment.
3. **Given** an unpublished page, **When** an anonymous visitor requests its address, **Then** a "not found" page is returned.
4. **Given** several published pages, **When** staff reorder the navigation menu, **Then** the public navigation reflects the new order immediately.

---

### User Story 9 - Publish the school's public agenda (Priority: P9)

Staff record upcoming school activities — an examination period, a parents' meeting, a school holiday, a competition — with a title, description, start and end time, and location. Visitors see the nearest upcoming activities on the homepage and can open a full agenda listing. Past activities remain readable but do not clutter the upcoming view.

**Why this priority**: A public agenda is what parents check most often after news, and it is the section that makes a school website feel maintained rather than abandoned. It ranks below the news pipeline because it is a distinct shape of content (forward-looking, time-bounded) rather than a variation of it, and it can ship cleanly on its own.

**Independent Test**: Create agenda entries dated in the past and in the future, publish them, and confirm as an anonymous visitor that the homepage shows only the nearest upcoming entries in ascending date order, while the full listing separates upcoming from past.

**Acceptance Scenarios**:

1. **Given** published agenda entries with future dates, **When** a visitor loads the homepage, **Then** the nearest upcoming entries are shown, soonest first.
2. **Given** an agenda entry whose end time has passed, **When** the homepage is loaded, **Then** it no longer appears among upcoming entries but remains reachable in the past-activity listing and at its own address.
3. **Given** an agenda entry spanning several days, **When** a visitor views it, **Then** the full date range and location are shown.
4. **Given** no upcoming entries exist, **When** a visitor loads the homepage, **Then** the agenda section shows a neutral empty state rather than an error or a blank block.

---

### User Story 10 - Publish public announcements (Priority: P10)

The portal team publishes an announcement aimed at the general public — a registration deadline, a schedule change, an official notice — optionally with a downloadable attachment and an expiry date after which it stops being current. These are the portal's own announcements, wholly separate from the classroom-scoped announcements inside SIAKAD.

**Why this priority**: Genuinely needed, but the Berita pipeline can carry an urgent notice in the interim, which makes this the safest of the remaining increments to defer. Its distinguishing features are the attachment and the expiry.

**Independent Test**: Publish an announcement with an attachment and an expiry date in the near future. Confirm it appears in the active announcements section, that the attachment downloads for an anonymous visitor, and that after expiry it leaves the active section while remaining at its own address.

**Acceptance Scenarios**:

1. **Given** a published announcement with no expiry, **When** a visitor loads the homepage, **Then** it appears among active announcements.
2. **Given** an announcement whose expiry has passed, **When** the homepage is loaded, **Then** it is no longer listed as active but remains reachable at its own address and in the announcement archive.
3. **Given** an announcement with a downloadable attachment, **When** an anonymous visitor opens it, **Then** the attachment can be downloaded without signing in.
4. **Given** an announcement exists in SIAKAD for a classroom, **When** the portal is viewed, **Then** that internal announcement does not appear publicly.

---

### User Story 11 - Publish photo galleries of school activities (Priority: P11)

After an event, portal staff create an album, upload the photo set once, give it a title, date, and cover, order and caption the photos, and publish it. Visitors browse albums and view photos full-size.

**Why this priority**: The most-viewed content type on many madrasah sites, and explicitly requested — but the increment most safely deferred, because an event report with one cover photo (P1) already conveys the news. It also depends on the media handling delivered in P6.

**Independent Test**: Create an album with several photos, order them, publish it, and confirm an anonymous visitor can open the album and view each photo at full size.

**Acceptance Scenarios**:

1. **Given** an album with photos, **When** staff publish it, **Then** anonymous visitors can browse the album and open each photo at full size.
2. **Given** an unpublished album, **When** an anonymous visitor requests its address, **Then** it is not visible.
3. **Given** an album with many photos, **When** a visitor opens it on a mobile connection, **Then** photos load progressively rather than blocking the page.
4. **Given** staff reorder photos within an album, **When** a visitor views it, **Then** the photos appear in the chosen order.

---

### Edge Cases

- **Scheduled item whose time passes while nobody is signed in** — it must become public on time regardless of whether any staff member or visitor triggers it.
- **Timezone ambiguity** — dates are entered and displayed in Indonesian local time (WIB); an item scheduled for "07:00" goes live at 07:00 WIB regardless of where the system is hosted.
- **Address collision** — two items titled "Peringatan Maulid Nabi" published in different years must both be reachable at distinct, stable addresses.
- **Address change after publication** — a shared or indexed address must keep resolving after the title or address is edited.
- **Author account deactivated or deleted** — previously published items keep their attribution and stay public; they must not become unattributed or disappear.
- **Portal operator loses their permissions** — content they already published stays public and stays attributed to them.
- **Unsafe authored markup** — scripts or unsafe embeds pasted into a body must never execute for a visitor.
- **Cover image missing or its stored file lost** — the item still renders with a neutral placeholder rather than a broken image or an error page.
- **Content service unavailable** — the homepage still renders its static sections and shows a neutral message where dynamic content would be; it must never fail to load entirely.
- **SIAKAD or PPDB in maintenance mode** — the public portal stays readable; the two are independently available.
- **Public endpoints under abusive load** — scraping or flooding of public content endpoints must not degrade the staff-facing applications.
- **Agenda entry spanning a boundary** — an activity running from 30 December to 2 January must appear as upcoming for its whole duration, not drop off at year end.
- **Agenda entry edited to a past date** — it leaves the upcoming section immediately, without deletion.
- **Announcement expiry set in the past at creation** — either refused at entry or published directly to the archive; it must not silently vanish.
- **Album with zero photos** — cannot be published, or publishes with an explicit empty state; it must not render a broken grid.
- **Very long titles, missing summaries, enormous bodies** — listing layouts must not break; limits are enforced at entry rather than discovered at render.
- **Deleted item still linked from an external site or search index** — visitors get a clear "not found" page, not an error.
- **An item unpublished while a visitor has it open** — the next navigation reflects the change; the already-rendered page need not self-destruct.
- **Two editors saving the same item concurrently** — the later save must not silently discard the earlier one.
- **Bulk import of historical content** — the system must tolerate items backdated to before the portal existed, ordering them by their stated publish date.

## Requirements *(mandatory)*

### Functional Requirements — Portal and Public Access

- **FR-001**: The public content MUST be served by a dedicated school portal application, distinct from the PPDB/admission application and from SIAKAD, with its own public address and its own branding.
- **FR-002**: All published portal content MUST be readable by anonymous visitors without signing in.
- **FR-003**: The portal MUST remain publicly readable while SIAKAD or the PPDB application is unavailable or in maintenance mode.
- **FR-004**: The portal MUST link visitors to the PPDB application for admission, and the PPDB application MUST remain the authority for admission content — the portal MUST NOT duplicate wave, quota, or registration data.
- **FR-005**: The portal MUST provide a management area, reachable only by signed-in staff holding content permissions, from which every content type in this specification is created and published.

### Functional Requirements — Authoring

- **FR-006**: Authorized staff MUST be able to create and edit a content item consisting of a title, a short summary, a formatted body, a cover image, a content type, a category, optional tags, and a publish date.
- **FR-007**: The system MUST generate a human-readable public address (slug) from the title, allow the editor to override it, and guarantee it is unique within its content type.
- **FR-008**: The system MUST NOT change an item's public address automatically after its first publication; an explicit change MUST keep the previous address working (FR-066).
- **FR-009**: The formatted body MUST support at minimum headings, bold and italic text, ordered and unordered lists, links, block quotes, and embedded images.
- **FR-010**: The system MUST neutralize any scripting or unsafe markup contained in authored content so that it cannot execute in a visitor's browser.
- **FR-011**: Editors MUST be able to preview an item exactly as visitors will see it before publishing.
- **FR-012**: The system MUST enforce that title, summary, body, content type, and category are present before an item can be published, while allowing any of them to be missing in a draft.
- **FR-013**: The system MUST prevent one editor's save from silently overwriting a concurrent change made by another editor.

### Functional Requirements — Publishing Lifecycle

- **FR-014**: Every content item MUST be in exactly one of these states: Draft, Scheduled, Published, or Archived.
- **FR-015**: Only Published items MUST be visible to anonymous visitors. Draft, Scheduled, Archived, and deleted items MUST NOT be retrievable by any public means, including by guessing an address.
- **FR-016**: An item scheduled for a future moment MUST become publicly visible automatically at that moment, without a staff member or visitor triggering it.
- **FR-017**: Editors MUST be able to unpublish a Published item, removing it from all public surfaces immediately.
- **FR-018**: The system MUST preserve the original publication timestamp across subsequent edits and record the last-edited timestamp separately.
- **FR-019**: Deleting a content item MUST be recoverable for at least 30 days, and restoring it MUST return it to its previous state and visibility.
- **FR-020**: The system MUST record the author of every item and MUST retain that attribution if the author's account is later deactivated, removed, or stripped of content permissions.

### Functional Requirements — Public Consumption

- **FR-021**: The portal MUST provide a public listing per content type, ordered appropriately for that type, and paginated.
- **FR-022**: The portal MUST provide a public detail page for each published item at its own stable address.
- **FR-023**: Visitors MUST be able to filter a public listing by category and by tag.
- **FR-024**: Visitors MUST be able to search published content by words appearing in the title or summary.
- **FR-025**: A detail page MUST suggest other published items so a visitor can continue reading.
- **FR-026**: A request for an address that is unknown, unpublished, or deleted MUST return the same clear "not found" response, revealing nothing about whether a draft exists.
- **FR-027**: Public content requests MUST be rate-limited so that scraping or flooding cannot degrade service for other users.

### Functional Requirements — Homepage Composition

- **FR-028**: The portal homepage MUST be composed of content-driven sections covering at minimum: latest Berita, upcoming Agenda, active Pengumuman, and latest Galeri.
- **FR-029**: The number of items shown in each homepage section MUST be configurable by an administrator without a code change, defaulting to three.
- **FR-030**: Editors MUST be able to pin specific items so they appear in a homepage section regardless of date, and unpin them again.
- **FR-031**: Each homepage section MUST render a neutral empty state or hide itself when it has no content, and MUST NOT break the page layout.
- **FR-032**: The homepage MUST continue to render its remaining sections if content for one section cannot be retrieved.
- **FR-033**: Changing what appears in the homepage's dynamic sections MUST require no code change and no deployment.

### Functional Requirements — Content Types and Taxonomy

- **FR-034**: The portal MUST support these content types, each with its own address space: **Berita**, **Artikel**, **Pengumuman**, **Agenda**, **Galeri**, and **Halaman**. All except **Halaman** MUST additionally have their own public listing. Halaman is exempt deliberately: informational pages are reached from the navigation menu (FR-053) and from links inside other content, never by browsing an index of them — an "all pages" listing is a site-map artefact no visitor asks for, and building one would invite pages to be published without a navigation entry, which FR-053 exists to prevent.
- **FR-035**: Berita, Artikel, and Pengumuman MUST share one authoring experience and one lifecycle, differing only in their type-specific fields and their public placement.
- **FR-036**: Administrators MUST be able to create, rename, and deactivate categories.
- **FR-037**: The system MUST refuse to delete a category still assigned to content, or require the content to be reassigned first.
- **FR-038**: Editors MUST be able to attach free-form tags to an item and reuse tags across items and across content types.

### Functional Requirements — Agenda

- **FR-039**: Staff MUST be able to create an agenda entry with a title, description, start time, end time, and location, and optionally a cover image.
- **FR-040**: The public agenda listing MUST separate upcoming activities from past ones, ordering upcoming by soonest first and past by most recent first.
- **FR-041**: An agenda entry MUST move out of the upcoming view automatically once its end time has passed, while remaining reachable at its own address.
- **FR-042**: The system MUST reject an agenda entry whose end time precedes its start time.

### Functional Requirements — Pengumuman

- **FR-043**: Staff MUST be able to publish a public announcement with a title, body, optional downloadable attachment, and optional expiry date.
- **FR-044**: An expired announcement MUST leave the active announcements view automatically while remaining reachable at its own address and in the announcement archive.
- **FR-045**: An attachment on a published announcement MUST be downloadable by anonymous visitors without signing in.
- **FR-046**: Portal announcements MUST be entirely separate from the internal classroom announcements in SIAKAD: no internal announcement is published to the portal, and no portal announcement appears in the internal classroom views.

### Functional Requirements — Galeri

- **FR-047**: Staff MUST be able to create a photo album with a title, date, description, cover image, and many photos.
- **FR-048**: Staff MUST be able to set the display order of photos within an album and give each photo a caption.
- **FR-049**: The public album view MUST allow a visitor to open each photo at full size.
- **FR-050**: Album photos MUST load progressively so that an album with many photos does not block the page on a mobile connection.
- **FR-051**: The system MUST refuse to publish an album containing no photos.

### Functional Requirements — Halaman and Navigation

- **FR-052**: Staff MUST be able to create, publish, and unpublish standalone informational pages, each with a title, public address, and formatted body.
- **FR-053**: Staff MUST be able to choose which published pages appear in the portal's public navigation and in what order, without a code change.
- **FR-054**: An unpublished page MUST return the same "not found" response as an unknown address.

### Functional Requirements — Media

- **FR-055**: Editors MUST be able to upload images and reuse previously uploaded images, without re-uploading the same file.
- **FR-056**: The system MUST reject uploads exceeding the configured size limit or outside the permitted formats, with a message stating the limit or the accepted formats.
- **FR-057**: Every image used in content MUST carry alternative text, and editors MUST be prompted when it is absent.
- **FR-058**: The system MUST refuse to delete a media file still referenced by any content item and MUST identify the items referencing it.

### Functional Requirements — Access Control and Separation of Operations

- **FR-059**: Creating, editing, publishing, unpublishing, and deleting content MUST each require an explicit permission, and the permission to publish MUST be separate from the permission to create or edit.
- **FR-060**: Portal content permissions MUST be distinct from academic, personnel, inventory, and admission permissions. Holding a content permission MUST NOT grant access to any student, grade, staff, asset, or applicant data.
- **FR-061**: The portal MUST be fully operable by staff who hold no SIAKAD, inventory, or admission role whatsoever.
- **FR-062**: Holding an administrative role in SIAKAD MUST NOT by itself confer the ability to publish to the portal.
- **FR-063**: Staff without any content permission MUST NOT see content management entries in the portal's menu.
- **FR-064**: The system MUST record which user performed every publish, unpublish, and delete action, and when.

### Functional Requirements — Discoverability and Sharing

- **FR-065**: When a public address is shared on a social or messaging platform, the preview MUST show the item's title, summary, and cover image.
- **FR-066**: An item's previous public address MUST keep resolving to the item after its address is changed.
- **FR-067**: The portal MUST expose a machine-readable list of all public addresses for search engines, containing every Published item and no Draft, Scheduled, Archived, or deleted item.
- **FR-068**: Editors MUST be able to set a search-result title and description per item, defaulting to the item's title and summary when not set.

### Key Entities *(include if feature involves data)*

- **Content Item**: A single publishable piece of feed content — Berita, Artikel, or Pengumuman. Carries a title, public address, summary, formatted body, cover image, content type, category, tags, lifecycle state, publication timestamp, last-edited timestamp, author, and optional search title/description. Pengumuman additionally carries an optional attachment and expiry date. Belongs to exactly one content type and one category; may carry many tags.
- **Content Type**: The kind of item — Berita, Artikel, Pengumuman, Agenda, Galeri, Halaman. Determines which public listing an item appears in, which fields apply, and how its address is formed.
- **Category**: An editor-managed grouping (Prestasi, Kegiatan, Akademik, Keagamaan). One category per item; a category holds many items; cannot be removed while in use.
- **Tag**: A free-form label attached to items for cross-cutting grouping, shared across content types. Many-to-many with content items.
- **Agenda Entry**: A public school activity with a title, description, start time, end time, location, optional cover image, lifecycle state, and author. Ordered forward in time rather than backward.
- **Gallery Album**: A titled, dated collection of photos with a description, cover image, lifecycle state, and an ordered set of photos, each with its own caption.
- **Portal Page**: A standalone informational page (Profil, Visi & Misi, Sejarah, Kontak) with a title, address, formatted body, and publish state — no category, tags, or feed placement.
- **Navigation Item**: An entry in the portal's public navigation, pointing to a page or a listing, with a label and a display order.
- **Homepage Section Configuration**: The administrator-set rules governing each homepage section — how many items it shows and which items, if any, are pinned into it.
- **Media Asset**: An uploaded file with its alternative text, dimensions, size, format, uploader, and upload time. Referenced as a cover image, an in-body image, an album photo, or an announcement attachment; cannot be deleted while referenced.
- **Author**: The staff member credited with an item, drawn from existing user accounts. Attribution survives deactivation or loss of permissions.
- **Publication Event**: The record of a publish, unpublish, or delete action — which item, which user, and when.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A staff member who has never used the system before can publish their first news item and see it live on the portal homepage within 10 minutes, using only on-screen guidance and without contacting a developer.
- **SC-002**: 100% of the dynamic homepage sections can be changed by non-technical staff — the number of code changes or deployments required to alter what a visitor sees there is zero.
- **SC-003**: A newly published item appears on the public homepage within 60 seconds of publication.
- **SC-004**: Zero unpublished items are ever retrievable by an anonymous visitor — verified by attempting direct access to draft, scheduled, archived, and deleted addresses across every content type, with every attempt returning "not found".
- **SC-005**: A portal operator account holds zero access to student, grade, personnel, asset, or applicant data — verified by attempting every such area and being refused in all of them.
- **SC-006**: The portal stays publicly readable for 100% of a SIAKAD maintenance window.
- **SC-007**: 95% of public content page loads render their main text and headline within 2.5 seconds, measured as Largest Contentful Paint against a **production build** under Chrome DevTools' "Slow 4G" profile (400 kb/s down, 400 kb/s up, 400 ms RTT) with cache disabled. The profile is named because "a typical Indonesian mobile connection" cannot be passed or failed — two people measuring it in good faith get different answers.
- **SC-008**: A visitor can reach the full text of any highlighted item from the homepage in a single click.
- **SC-009**: An item's public address remains valid indefinitely after publication, including after its title is edited — measured as zero broken addresses among previously shared links.
- **SC-010**: An editor can locate any item among the most recent 500 within 10 seconds using the management screen's search and filters.
- **SC-011**: An accidentally deleted item can be restored by staff within 30 days without developer or database intervention.
- **SC-012**: The portal serves at least 1,000 published items, 200 albums, and 10,000 monthly visitors with no measurable degradation of SIAKAD, inventory, or PPDB.
- **SC-013**: 100% of shared public addresses produce a rich preview showing headline, summary, and image on the messaging platforms the school actually uses.
- **SC-014**: Every published item is submitted for search-engine discovery — verified by what the portal controls, not by what a crawler chooses to do: the item appears in `/sitemap.xml` within 60 seconds of publication, that document validates against the sitemap protocol with absolute `<loc>` values, `/robots.txt` permits the path, and the item's detail page carries a canonical URL. Actual index inclusion and its timing are the search engine's decision and cannot be a criterion this project passes or fails.
- **SC-015**: A published album of 50 photos becomes usable to a visitor on a mobile connection within 3 seconds, without waiting for every photo to arrive.

## Assumptions

These are the defaults chosen where the request did not specify. Each is a decision that can be changed before planning, not a fact.

- **The portal homepage is "the landing page" in the original request.** The existing PPDB landing page keeps its current admission-focused content and is not modified by this feature. The public content contract is application-neutral, so the PPDB landing could consume portal content later if wanted, but that is not in scope here.
- **Single school, single language, single timezone.** Content is authored and displayed in Indonesian, dated in WIB (UTC+7). Multi-language content is not in scope.
- **Small editorial team.** Fewer than ten staff author content, so heavyweight editorial process is unwarranted.
- **Draft → Publish, with no separate approval step.** The safeguard is a permission boundary — the ability to publish is granted separately from the ability to write — rather than a review-and-approve workflow. A multi-step approval chain can be added later if the school's practice demands it.
- **Existing sign-in infrastructure is reused, with a separate permission set.** Portal operators authenticate through the same mechanism as other staff but are granted only content permissions; no new account type is introduced.
- **Existing file storage is reused** for images and attachments rather than a second storage mechanism.
- **Public read access is anonymous and rate-limited.** No visitor account, login, or gating for public content.
- **The internal classroom announcement and event functions in SIAKAD stay exactly as they are.** They are audience-scoped to classrooms and serve a different purpose; this feature neither replaces nor reads them, and staff post to the portal separately when something should be public.
- **Content volume is modest.** On the order of a few items per week — hundreds per year, not thousands per day.
- **Historical content may be backdated** on import, and ordering follows the stated publish date rather than the creation date.
- **The portal is a public marketing and information surface, not a service surface.** It presents information; it does not accept applications, payments, or personal data from visitors.

## Out of Scope (v1)

Named explicitly so the boundary is a decision rather than an oversight:

- Public comments, reactions, or any visitor-submitted content, including contact forms that store submissions.
- Multi-language or translated content.
- Email newsletters, broadcast, or push notification of new content.
- Full revision history with side-by-side comparison and rollback to an arbitrary earlier version — only the last-edited trail (FR-018) is in scope.
- Multi-site or multi-campus content separation.
- Paid, gated, or member-only content.
- Editorial calendars, assignment workflows, and content planning boards.
- Traffic analytics dashboards — public visit measurement is left to external tooling.
- Migrating content from any existing website or social media account.
- Video hosting; embedded video from external platforms is acceptable but the portal does not store video files.
- Moving the PPDB landing page into the portal, or merging the two applications.

## Dependencies

- **A new workspace application is an architectural decision.** The project constitution requires it to be recorded as an ADR, its package name to end in `-web`, its aliases to be declared in both the build and type configurations, and its branding to go through the shared authentication configuration rather than a fork. Planning must account for this.
- Existing authentication, role, and permission infrastructure — content permissions extend the current catalogue rather than introducing a parallel scheme, while remaining disjoint from academic and admission permissions (FR-060).
- Existing file upload and storage, extended with the alternative-text and in-use-reference requirements (FR-057, FR-058) and with public, unauthenticated download for announcement attachments (FR-045).
- The existing application settings mechanism, which holds the configurable homepage section counts (FR-029).
- The existing public-endpoint and rate-limiting precedent, which the portal's public content endpoints follow (FR-027).
- A reliable clock for scheduled publication and for agenda and announcement expiry (FR-016, FR-041, FR-044); the mechanism that makes these transitions happen without human action is a design decision for planning.
