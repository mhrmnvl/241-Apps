# Feature Specification: Fetch Only What Is Shown

**Feature Branch**: `004-reduce-overfetching`

**Created**: 2026-08-12

**Status**: Draft

**Input**: User description: "Reduce over-fetching and fragile Prisma includes in the backend, and eager duplicate fetching in the frontend, based on two audits committed today (docs/prisma_repository_audit.md and docs/api_fetching_audit.md)."

**Verified against the code, 2026-08-12.** Both audits were re-checked before this spec was written. Most findings hold; two do not, and are excluded here so they are not carried forward as work:

- The frontend audit's top finding claims the classroom management page loads a thousand-student list on open. It does not — that list is already loaded only when the "add student" dialog opens. What is eager on that page is nine reference-data requests, which is a caching concern, not a payload one.
- The backend audit implies personal data leaks to the browser during sign-in. It does not — the session endpoint returns only identity, roles and permissions. The defect is that the database is asked for columns nobody reads, which is a cost and a privacy-surface problem, not a leak.

**Confirmed and still true**: the same personal-data record is pulled in full in 19 places across 14 files; student list and student detail request identical data; the deepest read reaches six levels of related records; one reference list is read without excluding deleted rows; 42 files request reference lists capped at a thousand rows; one page loads a thousand subjects to fill a dialog that may never open; nothing reuses reference data between pages.

**Newer than the audits**: the session endpoint is now what all five applications call on every cold start, so the oversized record behind it is read far more often than when the audit was written.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Personal data stops travelling where it is not shown (Priority: P1)

A list of students, teachers, schedules or report cards shows people's names. Today, producing that list also pulls each person's national ID, date of birth, tax number, email and phone from the database — every time, for every row — even though the screen shows only a name. The same happens on sign-in, for every user, in every application.

**Why this priority**: It is the widest problem and the cheapest to fix, because the same pattern repeats identically in 19 places. It also shrinks most of the other findings as a side effect, and it reduces how far personal data travels inside the system, which matters independently of performance.

**Independent Test**: Pick any list screen that shows names. Confirm the data leaving the database for that screen contains the name and nothing that is not on the screen. Repeat for sign-in.

**Acceptance Scenarios**:

1. **Given** a staff member opens any list showing people's names, **When** the list loads, **Then** no personal field absent from that screen is read from the database.
2. **Given** a user signs in to any of the five applications, **When** the session is established, **Then** only the identity, roles and permissions needed to decide what they may open are read.
3. **Given** a new personal field is later added to the system, **When** it is added, **Then** no existing screen starts carrying it without someone deciding that it should.

---

### User Story 2 - Pages stop loading lists nobody asked for (Priority: P2)

Opening the curriculum subject page loads every subject in the school — a list used only by the "add subject" dialog, which the user may never open. Several other pages do the same for their own dialogs.

**Why this priority**: It is the largest single wasted transfer per page open, and it is visible: the page is slower to become usable for a user who only wanted to read the list.

**Independent Test**: Open an affected page and confirm the dialog-only list is not requested. Open the dialog and confirm it is requested then, and works.

**Acceptance Scenarios**:

1. **Given** a staff member opens a page containing a dialog they do not use, **When** the page finishes loading, **Then** data used only by that dialog has not been requested.
2. **Given** the staff member then opens the dialog, **When** it opens, **Then** the data it needs is fetched and the dialog is usable.
3. **Given** the staff member closes and reopens the dialog within the same visit, **When** it reopens, **Then** it does not re-request data that has not changed.

---

### User Story 3 - Reference data is not re-downloaded on every page (Priority: P2)

Academic years, semesters, classrooms, subjects and teachers change rarely. Today, moving between Kelas, Kurikulum, Penugasan Mengajar and Kehadiran re-requests the same lists each time, because nothing remembers them between pages.

**Why this priority**: It is what makes the application feel slow in ordinary use — the cost is paid on every navigation, not once. It is ranked below Story 2 because it needs a shared mechanism rather than moving existing calls.

**Independent Test**: Navigate between four pages that share reference data and confirm each list is requested once, not four times, within a single visit.

**Acceptance Scenarios**:

1. **Given** a staff member visits several pages that use the same reference list, **When** they navigate between them, **Then** that list is retrieved once and reused for a defined period.
2. **Given** a staff member changes a reference record, **When** the change is saved, **Then** screens showing that list reflect the change without a manual page reload.
3. **Given** the remembered period has elapsed, **When** the list is needed again, **Then** it is retrieved afresh.

---

### User Story 4 - Adding a field stops breaking unrelated screens (Priority: P3)

Reads that ask for "everything related" break when anything related changes. This has already caused a crash after a migration. It also means a list page and a detail page fetch identically, because neither states what it actually needs.

**Why this priority**: It is a resilience outcome rather than a speed one, and it is largely delivered as a consequence of Stories 1 and 3. It is stated separately because it needs a rule to hold afterwards, not just a one-off cleanup.

**Independent Test**: Add a column to a widely-related record and confirm no screen changes behaviour or fails.

**Acceptance Scenarios**:

1. **Given** a new column is added to a widely-referenced record, **When** the change is deployed, **Then** no existing screen fails and none of them start returning the new column.
2. **Given** a list screen and a detail screen for the same subject, **When** each loads, **Then** the list does not retrieve the detail screen's extra data.
3. **Given** a reference list that supports soft deletion, **When** it is read, **Then** deleted rows are excluded.

---

### Edge Cases

- A person has no name recorded. Screens must still render the row with a clear placeholder rather than failing.
- A reference list is edited by one staff member while another is viewing a page that remembered it. The second staff member must not be blocked from saving; they must see the current list once the remembered period elapses or the list is invalidated.
- A dialog is opened before its data has arrived. The dialog must show that it is loading rather than appearing empty and inviting a wrong choice.
- A screen genuinely needs a personal field beyond the name — for example a printed card showing a national ID. Those screens must keep working, which means the rule is "state what you need", not "never read personal fields".
- Reference lists capped at a thousand rows will eventually exceed that cap. Screens that pick from a list must remain usable when the list is longer than the cap.

## Requirements *(mandatory)*

### Functional Requirements

**Reading only what is shown**

- **FR-001**: The system MUST retrieve only the fields a screen displays or acts on. Retrieving a whole related record because one of its fields is needed is not permitted.
- **FR-002**: The system MUST define the fields it retrieves for a person in named, reusable shapes, so that the same decision is not re-made in each of the 19 places it currently appears.
- **FR-003**: Establishing a session MUST read only the identity, roles and permissions required to decide what the signed-in person may open.
- **FR-004**: A screen that legitimately needs personal fields beyond a display name MUST state those fields explicitly rather than requesting the whole record.
- **FR-005**: Reads of records that support soft deletion MUST exclude deleted rows.

**Fetching when needed, not before**

- **FR-006**: Data used only by a dialog MUST be retrieved when the dialog opens, not when the page containing it loads.
- **FR-007**: A list screen and a detail screen for the same subject MUST NOT retrieve identical data; the list MUST retrieve strictly less.
- **FR-008**: Independent requests needed for the same screen MUST be issued together rather than in sequence, unless one genuinely depends on another's result.

**Reusing what was already retrieved**

- **FR-009**: Reference data that changes rarely MUST be reused across screens within a visit rather than re-requested on each navigation.
- **FR-010**: Each kind of reference data MUST have a stated period after which it is retrieved afresh.
- **FR-011**: Creating, changing or deleting a reference record MUST cause screens showing that data to reflect the change without a manual page reload.

**Keeping it true afterwards**

- **FR-012**: The rules above MUST be written down where the next person adding a read will encounter them.
- **FR-013**: Existing behaviour MUST NOT change: every screen MUST show the same information after this work as before it, except where a field was verifiably unused.

### Key Entities

- **Person display shape**: the fields needed to show a human being on a screen — a name, and where the screen shows a picture, an avatar reference. Distinct from the full personal record, which holds identifying and contact information.
- **Session identity**: who is signed in and what they may open. Distinct from a person's profile.
- **Reference list**: a rarely-changing list a user picks from — academic years, semesters, classrooms, subjects, teachers, positions, employment types, religions, blood types, occupations.
- **List view versus detail view**: two different needs for the same subject, currently served identically.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: No screen retrieves a personal field it does not display. Verified by inspecting every read that touches a person, and confirmed at zero remaining whole-record reads of the personal record.
- **SC-002**: Navigating between four screens that share reference data retrieves each shared list once per visit instead of once per screen.
- **SC-003**: Opening a page whose dialog is not used transfers no data belonging to that dialog — measured as at least one fewer request and no thousand-row list.
- **SC-004**: A list screen transfers less data than the corresponding detail screen for the same records.
- **SC-005**: Adding a column to the personal record changes no screen's behaviour and appears in no response that did not ask for it.
- **SC-006**: Every screen shows the same information after this work as before it, confirmed screen by screen against the current behaviour.
- **SC-007**: The full automated check suite passes unchanged, and no screen loses a field that a user could previously see.

## Assumptions

- **Scope covers every domain, not only academic.** The personal-record pattern appears in academic, admission, inventory, portal, presence and platform. Fixing 14 of 19 places would leave the rule half-true and the next person unsure which half applies.
- **No behaviour changes for users.** This work removes data nobody looks at. If a field turns out to be displayed somewhere, it stays. Anything ambiguous is kept rather than removed.
- **Response shapes stay compatible.** Fields are removed from a response only where it has been confirmed no screen reads them. Where confirmation is not possible, the field stays.
- **A shared reference-data mechanism is introduced once and used by all five applications** rather than each application solving it separately, consistent with the workspace rule that code used by two or more applications is promoted to a shared package.
- **Measurement is relative, not absolute.** There is no existing performance baseline, so success is measured as "fewer requests and smaller payloads than before" on named screens, not against an absolute target.
- **The thousand-row cap is not fixed by this feature.** Lists that will outgrow it need searchable pickers, which is a separate change; this feature only stops those lists being fetched when nothing needs them.
- **The two corrected audit findings are excluded.** The already-lazy student list is not re-worked, and the session endpoint is treated as an over-fetch to fix, not a data leak to contain.

## Dependencies

- The two audit reports committed on 2026-08-12, as the inventory of affected locations — with the two corrections recorded above.
- The workspace constitution's rule that a cross-cutting dependency added to the applications requires justification in the plan.
