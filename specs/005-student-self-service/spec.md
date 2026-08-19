# Feature Specification: Separate the student surface from the management surface

**Feature Branch**: `005-student-self-service`

**Created**: 2026-08-14

**Status**: Draft

**Input**: User description: "Separate the academic app's student-facing surface from its management surface, and close the data exposure that the current mixing creates."

## Context

SIAKAD 241 already advertises a student surface. The sidebar carries a section
labelled **Siswa**, shown only to holders of the STUDENT role, offering four
entries under *Akademik Saya*: Jadwal Pelajaran, Kehadiran, Nilai, Rapor.

None of those four leads anywhere built for a student. They lead to the screens
the school's staff use to run the school: the attendance-taking sheet, the list
of assessment items awaiting marking, and the report-card console with its
generate, publish and export actions.

The links are not merely misdirected. They work. The STUDENT role is granted
`students.read`, `attendances.read` and `report-cards.read` — the same
authorizations those management screens require — and the reads behind them are
not scoped to the person asking. A student who opens their own menu is served
every student's report card, including scores, rank and the homeroom teacher's
written note, and the attendance recap for the whole school.

Nobody is exposed today, and that is a matter of timing rather than design:
neither database has a STUDENT role at all. It becomes live the first time such
a role is created and a student signs in. Production is about to be populated
through the UI rather than from a seed, so that moment is close.

This specification separates the two surfaces. It is deliberately split so the
exposure can be closed on its own, ahead of and independently of the screens
that make the student surface worth visiting.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A student can only ever read their own record (Priority: P1)

A student signs in and, whether through the menu, a bookmarked address, or a
request made by hand, attempts to read academic records. They receive their own
and nothing else. A request for the school-wide list is refused rather than
answered with a filtered copy.

**Why this priority**: This is the whole reason the work exists, and it stands
on its own. It can ship before any new screen and leaves the system strictly
safer than it is now. Until it ships, every other part of this feature is
decoration on an open door.

**Independent Test**: Grant a test account the student authorizations, sign in,
and request the report-card, score and attendance collections directly. Every
response either contains only that student's rows or is refused. Repeat with a
second student's identifier supplied explicitly as a filter and confirm it
changes nothing.

**Acceptance Scenarios**:

1. **Given** a student with the student-level authorizations, **When** they
   request the report-card collection, **Then** the response contains only their
   own report cards, and contains them regardless of which classroom or semester
   filter was supplied.
2. **Given** that same student, **When** they explicitly ask for another
   student's report card by identifier, **Then** the request is refused, and the
   refusal does not disclose whether that report card exists.
3. **Given** that same student, **When** they request the attendance recap for a
   classroom, **Then** the request is refused, because a recap is a statement
   about a group and not about them.
4. **Given** a staff member holding the management authorization, **When** they
   request the same collections, **Then** they receive the school-wide data
   exactly as they do today.
5. **Given** a student, **When** they request a report card that exists but has
   not been published, **Then** it is not returned, because an unpublished
   report card is a draft the school has not yet stood behind.

---

### User Story 2 - A student sees their own academic record on screens built for them (Priority: P2)

A student opens *Akademik Saya* and finds four screens that answer questions
about themselves: when their classes are, whether they have been marked present,
what they scored on each assessment, and what their report card says. Nothing on
those screens offers to change anything, mark anyone, or publish anything.

**Why this priority**: Without it the student surface is a set of links that
correctly refuse to work. That is safe but not useful, and the school will ask
what the menu is for.

**Independent Test**: Sign in as a student and visit each of the four entries.
Each renders that student's own data, shows a plain empty state where there is
none, and offers no action that writes.

**Acceptance Scenarios**:

1. **Given** a student in a classroom with a timetable, **When** they open their
   schedule, **Then** they see their own classroom's lessons for the active
   semester without being asked to choose a classroom.
2. **Given** a student, **When** they open their attendance, **Then** they see
   their own daily record and their own totals, and no other student appears.
3. **Given** a student whose teacher has not yet entered marks, **When** they
   open their scores, **Then** they see the assessments that exist with their
   marks still blank, rather than an error or an empty page.
4. **Given** a student whose report card is published, **When** they open it,
   **Then** they see their own subjects, marks, predicates and the teacher's
   note; **And** no generate, publish, delete or export-for-others action is
   present anywhere on the screen.

---

### User Story 3 - A teacher's own schedule survives a role the school invented (Priority: P3)

A teacher signs in and sees their own teaching schedule. This holds whether the
school assigned them the built-in teacher role or a role it created itself —
"Guru Honorer", "Wali Kelas", "Sarana dan Prasarana" — because what decides the
answer is that the person has a teaching record, not what their role is called.

**Why this priority**: It is a live wrong-answer rather than a disclosure: today
the schedule screen decides what to show by comparing the user's role name to
the literal string TEACHER, so a teacher holding any custom role is shown the
administrator's classroom picker instead of their own timetable. The school
already runs at least one custom role.

**Independent Test**: Assign a teaching account a custom role carrying the same
authorizations, sign in, and confirm the schedule screen shows that person's own
teaching schedule rather than a classroom picker.

**Acceptance Scenarios**:

1. **Given** a teacher holding a school-created role rather than the built-in
   one, **When** they open the schedule, **Then** they see their own teaching
   schedule.
2. **Given** a staff member with no teaching record, **When** they open the
   schedule, **Then** they are offered the classroom picker as they are today.
3. **Given** a person who both teaches and administers, **When** they open the
   schedule, **Then** they can reach both their own schedule and any classroom's.

---

### Edge Cases

- A student who is not enrolled in any classroom for the active semester — the
  screens must say so plainly rather than fail or show another classroom.
- A student enrolled in more than one semester — the current semester is the one
  shown, and the earlier ones remain reachable rather than being merged into it.
- A person who holds both student-level and management-level authorization: the
  management authorization wins, so they are not accidentally locked out of the
  screens they administer.
- A person holding the student-level authorization who has no student record at
  all — a staff account granted it by mistake. The response is empty, never
  another person's data.
- An account whose student record was soft-deleted mid-session.
- A student requesting a semester in which they were not yet enrolled.

## Requirements *(mandatory)*

### Functional Requirements

**Closing the exposure (User Story 1)**

- **FR-001**: Reading one's own academic records MUST be a separate
  authorization from reading the school's. Holding the self-authorization MUST
  NOT grant any access to another person's record.
- **FR-002**: Every read reachable with the self-authorization MUST be scoped to
  the signed-in person by the system, not by a filter the caller supplies.
  Supplying a different person's identifier MUST NOT widen the result.
- **FR-003**: A request for data that describes a group rather than an
  individual — a class recap, a school-wide list, a trend across students — MUST
  be refused to a caller holding only the self-authorization.
- **FR-004**: The student role MUST hold only self-authorizations for report
  cards, scores and attendance. It MUST NOT hold the management authorizations
  it holds today.
- **FR-005**: An unpublished report card MUST NOT be readable through a
  self-authorization.
- **FR-006**: The new authorizations MUST reach an installation that never runs
  a seed, and MUST be assignable through the existing role screen.
- **FR-007**: Existing management behaviour MUST be unchanged for callers who
  hold the management authorization.
- **FR-008**: While User Story 2 is outstanding, the four student menu entries
  MAY fail. They MUST NOT show another student's data in the meantime.

**Building the student surface (User Story 2)**

- **FR-009**: The student surface MUST offer, as its own screens, the student's
  schedule, attendance, scores and report card.
- **FR-010**: Those screens MUST NOT present any action that writes, publishes,
  or reaches another student — not disabled, but absent.
- **FR-011**: Those screens MUST NOT ask the student to choose a classroom or a
  student; the system already knows both.
- **FR-012**: The four student menu entries MUST point at those screens.
- **FR-013**: Where a student has no data — no enrolment, no marks yet, no
  published report card — the screen MUST say so in plain language.

**Removing the role-name branch (User Story 3)**

- **FR-014**: What a screen shows MUST NOT depend on comparing a role's name to
  a literal. The one sanctioned exception remains the break-glass bypass, which
  lives in a single place and is not to be copied.
- **FR-015**: The teaching schedule a person is shown MUST be the one their
  teaching record says is theirs, resolved by the system rather than declared by
  the caller. Whether the screen is *offered* follows from authorization, as
  every other screen does; what it *contains* follows from the record. A person
  authorized but without a teaching record sees an empty schedule, not
  another person's.
- **FR-016**: A person who both teaches and administers MUST be able to reach
  both their own schedule and any classroom's.

### Key Entities

- **Self-authorization**: The right to read one's own record of a given kind,
  distinct from the right to read everyone's. Assignable to a role like any
  other authorization.
- **Student record**: The link between a signed-in account and the person whose
  academic history is being read. Its absence means an empty result, never a
  wider one.
- **Enrolment**: Ties a student to a classroom within a semester, and is what
  makes "my classroom" and "my schedule" answerable without asking.
- **Teaching record**: Ties an account to the lessons they teach, and is what
  makes "my teaching schedule" answerable without consulting a role name.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A student account can reach zero records belonging to another
  student, across every academic read the application exposes — verified by
  attempting each one, including with another student's identifier supplied
  deliberately.
- **SC-002**: The four entries on the student menu each lead to a screen that
  shows only that student's own data, with no action that writes.
- **SC-003**: A student can answer "am I marked present today", "what did I
  score", and "what does my report card say" without choosing a classroom, a
  student, or a semester.
- **SC-004**: A teacher assigned a school-created role sees their own teaching
  schedule, confirming no screen decides what to show from a role's name.
- **SC-005**: Staff-facing behaviour is unchanged: every management screen shows
  what it shows today, with the same authorizations.
- **SC-006**: A school starting from an empty database can grant a student the
  correct access entirely through the role screen, without running a seed.

## Assumptions

- **Scope is the academic app.** Presence, payroll, inventory, portal and
  admission are untouched. Presence already separates its self-service surface
  and is the model being followed, not a thing to change.
- **Published only.** A student sees a report card once the school publishes it.
  Drafts stay internal. This mirrors what publishing already means.
- **"Nilai" means per-assessment marks** for the active semester — the marks
  behind the report card — since the menu lists Nilai and Rapor as separate
  entries and a report card already summarises the term.
- **Parents are out of scope.** A PARENT role exists but has no surface today,
  and giving guardians access to a child's record is a larger question about
  which guardian may see which child.
- **The active semester is the default** everywhere on the student surface,
  consistent with the rule that a period-scoped read falls back to the active
  period rather than reading across years.
- **Teachers keep using the management screens** for the work they do to
  others' records — marking attendance, entering scores. Only "my own teaching
  schedule" is being separated here.
- **Authorization stays permission-based.** The work adds authorizations rather
  than role checks, and does not disturb which roles bypass which prefixes.
- **This lands on `dev` like everything else** and does not depend on, or
  reorder, the six fixes already waiting there to be promoted.
