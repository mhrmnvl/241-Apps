# Phase 0 Research: QR Card Attendance, Leave & Payroll

**Feature**: `002-qr-attendance-payroll` | **Date**: 2026-08-10

Twelve decisions. Each was checked against the code in this repository rather than against
what the documentation claims, because several of the relevant facts are only true in the
code.

---

## R1 — Where this lives: domain separation, not application separation

**Decision**: two new backend domains, `presence/` and `payroll/`, both under
`backend/src/`, surfaced as two new feature groups inside the existing `apps/academic`.
No fifth application. `presence/` keys on `userId`, not on `Student` or `Teacher`.

**Rationale**: the decisive constraint is the dependency graph, and keying on `userId` is
what makes it acyclic.

Verified in the schema: `Student.userId` (`student.prisma:10`) and `Teacher.userId`
(`teacher.prisma:3`) are both `@unique` and both required. Every person who could hold a
card already has exactly one `User`. So a credential points at a user, and the presence
domain never needs to ask academic who anyone is.

That yields:

```
platform/   ←── presence/     (presence depends on platform only)
presence/   ←── academic/     (academic/attendance reads the gate suggestion)
presence/   ←── payroll/      (payroll reads monthly recaps)
academic/   ←── payroll/      (payroll reads the employee roster)
```

No cycle. Had presence instead keyed on `Teacher` and `Student`, `presence → academic` and
`academic → presence` would both exist and the domains would be mutually dependent — the
exact shape the constitution's Principle II exists to prevent.

**One consequence has to be paid for rather than assumed away.** FR-011 requires
distinguishing a genuine absence from a day the person was never expected — including days
outside their employment or enrolment. Keying on `userId` means presence cannot see
`TeacherPosition.hireDate` or a student's enrolment dates, so **credential validity is the
window instead**: a person is expected on a date when they held a credential covering it.
This is not a workaround. A new hire with no card yet cannot scan, so counting them absent
would record a card-issuance delay as an attendance failure. It does make card issuance and
revocation operationally load-bearing — issuing the card starts someone's attendance history,
revoking it ends it — and that is stated in data-model.md rather than left to be discovered.

On the application question the spec asked directly: a dedicated attendance app would need
the employee roster, which lives in `academic/` (`Teacher`, `TeacherPosition`, `Position`,
`EmploymentType`). Principle II forbids app→app imports, so the new app would either
duplicate personnel management or reduce to a shell over another app's API. Meanwhile the
people doing the correcting — wali kelas and guru mapel — already open `apps/academic`
daily. ADR-0005 gave `portal` its own app because its **audience** was the public with a
different auth posture; this feature's audience is the same school staff, so the same test
points the other way.

**Alternatives considered**:

- *Everything inside `academic/attendance`* — rejected. Two different data shapes (a status
  per lesson versus a timestamp pair per day) in one module, and it would put salary tables
  behind the same permission prefix as a teacher's daily attendance screen.
- *A fifth app (`apps/presence`)* — rejected above. Cost is concrete and was measured on the
  last one: package name must end `-web`, aliases in two files, a `validate` chain, auth
  branding, sidebar, deploy target, CI. ADR-0005 is the precedent for when that is worth it.
- *One combined `presence/` domain including payroll* — rejected. It makes ADR-0008's
  bypass narrowing inexpressible, since the exemption works on the permission's module
  prefix.
- *Payroll inside `platform/`* — rejected. `platform/` is a supplier to every domain
  (Principle II); salary data must be a consumer of things, not a supplier to everything.

**Follow-up**: ADR-0007 records the new domain and the `academic/ → presence/` edge.

---

## R2 — Gate input: HID keyboard-wedge scanner first, camera later

**Decision**: the kiosk page reads scans from a **USB HID barcode scanner** — a device that
presents itself to the operating system as a keyboard and "types" the decoded code followed
by Enter into a focused input. Ship this path first. Add camera scanning only if a second
gate needs it, and when that happens prefer the native `BarcodeDetector` API with a WASM
decoder as fallback. **No scanning library is added now.**

**Rationale**: this removes a dependency, a permission prompt, and a failure mode, in
exchange for hardware costing roughly Rp 200–600k. An HID scanner needs no driver, no SDK,
no vendor integration and no camera permission; the kiosk page is a text input with a
keypress handler. It is also markedly faster per person than a camera under the one
condition that matters here — a queue of pupils at 06:50 in variable morning light.

The camera path is genuinely worse for the primary use: it needs `getUserMedia` (hence
HTTPS and a permission grant that survives reboots), it burns CPU on a cheap tablet, and
its decode latency under poor light is exactly when the queue is longest. It stays viable
as a secondary gate or a fallback, which is why the design keeps the ingest endpoint
transport-agnostic — it accepts a code string and does not care how the code was read.

The one thing an HID scanner *cannot* do is prove which device scanned. That is solved
separately by the device token (R7), not by the scanner.

**Alternatives considered**:

- *`html5-qrcode` / `@zxing/browser` / `jsQR` from day one* — rejected as a dependency and a
  bundle cost bought before the need is proven.
- *A commercial attendance machine (fingerprint/RFID/QR)* — rejected. Each brand has its own
  protocol, many are closed, and the records live in the machine until exported, which
  splits the source of truth. The spec puts biometrics out of scope in any case.
- *Manual code entry only* — kept as a deliberate fallback on the kiosk page for a broken
  scanner, not as the primary path.

**Cross-check**: the QR *encoder* for printing cards is a separate concern and does need a
library — `qrcode`, MIT, no peer dependencies. Encoding is Reed–Solomon plus mask selection
plus version sizing; that is an algorithm, not a snippet.

---

## R3 — Trusted time across an offline window

**Decision**: the server stamps every scan. For scans taken while offline, the device
computes the time from a **server-anchored monotonic clock**, never from its wall clock:
on each successful contact the server returns its own time, the device stores
`(serverTime, performance.now())` as an anchor, and an offline scan is stamped
`serverTimeAtAnchor + (nowMonotonic − anchorMonotonic)`. The payload carries both that
derived `occurredAt` and the anchor it was derived from; the server records `receivedAt`
independently and rejects a derived time that is in the future or older than the maximum
offline window.

**Rationale**: FR-010 and SC-013 pull against each other — times must not come from the
device, yet must survive four hours with no server. A monotonic counter resolves it. Unlike
`Date.now()`, `performance.now()` is unaffected by the user or NTP changing the system
clock, so the only trust placed in the device is elapsed duration since a server-provided
instant, which is far weaker than trusting its idea of what time it is.

The server keeping `receivedAt` separate from `occurredAt` is what makes the arrangement
auditable after the fact: a device with an implausible offset shows up as a widening gap
between the two rather than as silently wrong attendance.

**Alternatives considered**:

- *Trust the device wall clock offline* — rejected. A tablet at a school gate is exactly the
  device whose clock someone will change, and a 30-minute shift is the difference between
  late and on time.
- *Discard offline scans* — rejected; SC-013 requires zero loss.
- *Record only `receivedAt`* — rejected: a four-hour outage would stamp the whole morning's
  arrivals at lunchtime and mark everyone late.

---

## R4 — Scan idempotency and duplicate suppression: two different problems

**Decision**: treat them separately.

1. **Transport retries** — the device generates a `clientEventId` (UUID) per scan and
   reuses it on retry. `PresenceScan` carries `@@unique([deviceId, clientEventId])`, so a
   retried batch is absorbed by the database rather than by application logic.
2. **Human repeat scans** — a second accepted scan for the same credential within a
   configurable window (default 60 seconds) is stored as a scan with outcome `DUPLICATE`
   and does not alter the daily record. Outside the window, the second scan sets check-out.

**Rationale**: FR-006 and Acceptance Scenario 1.6 describe the human case — someone scans
twice because the beep was ambiguous — and the failure mode is severe: with no window, a
double-tap at 07:00 records departure at 07:00 and the person appears to have worked zero
minutes. Sixty seconds is long enough to absorb a double-tap and far shorter than any real
same-day departure.

Keeping the retry case in a unique constraint rather than in code matters because the
offline flush is a batch: partial application followed by a retry is the normal path, not
an edge case, and the database is the only place that can make it idempotent under
concurrency.

Storing duplicates rather than dropping them keeps FR-003 honest — every attempt is
retained, including the ones that changed nothing.

**Alternatives considered**:

- *One mechanism for both* — rejected: a retry must be invisible, while a human repeat is a
  real event someone may need to see.
- *Explicit in/out buttons on the kiosk* — rejected. It doubles the interaction at the
  moment the queue is longest, and mis-taps produce worse data than the time window does.

---

## R5 — Money: `Decimal(15,2)`, whole rupiah, round-then-sum

**Decision**: store money as Prisma `Decimal @db.Decimal(15, 2)`, matching the existing
precedent in `inventory.prisma` (`purchase_price`, `current_book_value`) and
`admission.prisma`. Round **each component line** to whole rupiah with half-up, then sum
the rounded lines to reach gross, deductions, and net.

**Rationale**: FR-046 and SC-015 require that listed components sum exactly to the stated
net. Rounding at the end instead of per line breaks that: three lines of Rp 333.33 shown as
Rp 333 each display a total of Rp 999 beside a net of Rp 1.000. Rounding each line first
makes what the payslip shows and what it totals the same arithmetic, which is the property
a payslip is actually judged on.

`Decimal(15,2)` rather than an integer-rupiah column keeps the column type consistent with
the two money tables already in this schema, and keeps rates expressible (a per-minute late
deduction is naturally fractional even when the resulting line is not). Floating point is
not an option and never was.

**Alternatives considered**:

- *`Int` rupiah everywhere* — rejected for schema inconsistency and loss of fractional rates.
- *Round only the net* — rejected above; it is the specific defect SC-015 tests for.
- *Banker's rounding* — rejected. Half-up is what Indonesian payroll practice and every
  spreadsheet the bendahara will check against does.

---

## R6 — Seeding per-lesson attendance: pull, never push

**Decision**: a gate scan writes **nothing** to `attendances`. When a teacher opens a class
for a date, `academic/attendance` calls a new `GetAttendanceSuggestionsUseCase`, which asks
`presence/daily-record` for that date's records for the relevant user IDs and returns them
as unconfirmed suggestions. The teacher's save is the only thing that writes a per-lesson
row, through the existing `bulkUpsert` path.

**Rationale**: three reasons, in order of weight.

FR-022 requires existing per-lesson records to be untouched, and FR-020 makes the teacher's
value authoritative. A push would have the presence domain writing rows that the report card
then reads — precisely the authority the spec removes from it.

Second, volume: pushing would create roughly 400 students × up to 8 lessons of rows every
morning, most of which a teacher then overwrites. Pulling creates zero.

Third, correctness under the interesting case: a student who scans in and skips fourth
period. With a pull, the teacher's absence for that lesson simply is the record. With a
push, the row already says present and the teacher is correcting a value the system
asserted — and if the push arrives late (offline flush at 10:00), it may overwrite a
correction the teacher already made.

The call is a direct awaited in-process call to an exported use case, consistent with
ADR-0002: no event emitter is installed, and this is a read, so nothing needs publishing.

**Alternatives considered**:

- *Push on scan* — rejected on all three grounds above.
- *A nightly job materialising the day's suggestions* — rejected; it produces the same
  overwrite hazard a few hours later and adds a scheduled job to keep alive.
- *A database view joining the two* — rejected; it would couple the schemas across a domain
  boundary that Principle VI exists to keep separate.

---

## R7 — Device authentication beside the global `JwtAuthGuard`

**Decision**: register each gate terminal as a `PresenceDevice` with a **bearer token shown
once at registration and stored only as a hash**. Scan-ingest routes are marked with a
`@DeviceAuth()` decorator that opts out of `JwtAuthGuard` and into a `DeviceGuard` resolving
the token to a device. Tokens are individually revocable and rotatable. Device routes accept
**only** ingest and clock-anchor calls — no reads of anyone's history.

**Rationale**: the kiosk is an unattended appliance in a public part of the school. Logging
it in as a person would attribute every scan to whoever logged in and leave a full-privilege
staff session sitting at the gate all day, reachable by anyone who walks past.

The mechanism is not new to this codebase — `@PortalPublic()` already establishes how a
route opts out of the global guard, and `app.module.ts` shows `JwtAuthGuard` and
`PermissionGuard` registered as global `APP_GUARD`s, so the opt-out shape is the supported
one. This is the same pattern with a narrower credential.

Hashing the token means a database leak does not hand over a working gate credential.
Restricting device routes to ingest means a stolen tablet can create scan noise — visible,
correctable, attributable to one device — but cannot read a single person's attendance
history or anything else.

**Alternatives considered**:

- *Shared service-account login* — rejected above.
- *IP allowlisting only* — rejected; school networks use DHCP and NAT, and it authenticates
  a network rather than a device.
- *mTLS* — rejected as disproportionate certificate management for a handful of terminals.

---

## R8 — Payroll authorization: narrow the `ADMIN` bypass at `payroll-`

**Decision**: add `payroll-` to `ROLE_BYPASS_EXEMPT_PREFIXES` in
`permission.guard.ts:25`, alongside the existing `portal-`. `SUPER_ADMIN` keeps its
break-glass bypass. Every payroll permission then requires an explicit grant. Seed
`ADMIN` with every permission **except** `payroll-*`, mirroring exactly what `iam.seed.ts`
already does for the portal. Separately, FR-043 splits `payroll-salaries.update` (deciding
what someone is paid) from `payroll-runs.create` (calculating the month).

**Rationale**: without the exemption, every `ADMIN` reads every salary in the school by
virtue of holding the role, and no permission grant can prevent it — the bypass runs before
grants are consulted. Verified in `permission.guard.ts`: `isExemptFromRoleBypass()` is the
only thing standing between a role and a permission.

ADR-0006 established both the precedent and the reasoning for exactly this situation, and
the constitution's Principle III already states that adding a prefix is an amendment rather
than a configuration change. So this is a well-trodden path, not an invention: ADR-0008
plus a constitution bump to 1.2.0.

Splitting salary-setting from run-execution matters because the two roles are genuinely
different people in a school — the bendahara calculates, the kepala madrasah decides pay —
and collapsing them means whoever runs payroll can quietly raise their own salary first.

**Alternatives considered**:

- *Grant nothing to ADMIN and rely on that* — rejected; the bypass ignores grants entirely.
- *A dedicated `BENDAHARA` role checked by name* — rejected outright by Principle III, which
  forbids role-name comparisons outside the guard.
- *Column-level encryption on salary* — rejected as scope; it defends against a database
  compromise, while the actual requirement (FR-051) is about application-level authority.

---

## R9 — Non-working days: own table, imported from the academic calendar

**Decision**: `presence/` owns a `NonWorkingDay` table, populated by an explicit,
operator-triggered import from `AcademicCalendar` entries of a designated type, and editable
directly. **The import is composed in the browser, not in the backend**: the presence UI reads
the existing academic calendar endpoint, previews the dates, and posts them to a
presence-owned bulk write. No backend call goes from `presence/` to `academic/`.

**Rationale**: Principle VI says a repository queries only its own module's models, so
presence cannot read `academic_calendars` directly and would otherwise need a port call on
every attendance evaluation — a join replaced by a network-shaped dependency on the hottest
read path in the feature.

There is also a modelling mismatch worth naming. `AcademicCalendar` (verified at
`academic.prisma:41`) has `academicYearId`, `semesterId`, `title`, `typeId`, `startDate`,
`endDate` — but no flag saying "nobody works this day". Its types are master data the school
edits freely, so "a national holiday" is a convention over a `typeId`, not a property. Basing
payroll deductions on a convention someone can rename in a master-data screen is the kind of
silent failure Principle III warns about.

An explicit import keeps the academic calendar as the place holidays are declared, while
presence keeps a record of what it actually judged against — which is also what FR-027
needs, since a closed period must not be re-judged when the calendar changes later.

Composing the import in the browser rather than the backend is what keeps R1's graph honest.
A server-side import would mean `presence/ → academic/`, and Ports 1 and 2 already establish
`academic/ → presence/` — that is a domain cycle, bought for nothing, since the operator's
browser holds both permissions already. It also buys a preview: the operator sees which dates
are about to become non-working before committing, which matters for an action that changes
everyone's attendance evaluation.

**Alternatives considered**:

- *Read `AcademicCalendar` through its port on every evaluation* — rejected for coupling and
  hot-path cost.
- *A server-side import use case in `presence/`* — rejected: it closes the domain cycle
  described above, and gives the operator no preview.
- *Derive holidays only from weekday patterns* — rejected; national holidays are not weekly.
- *Duplicate the calendar automatically on write* — rejected; it is a hidden write fan-out
  across a domain boundary, and ADR-0002's reasoning applies.

---

## R10 — Employee coverage: roster-driven, dormant accounts for non-users

**Decision**: eligibility follows the employee roster, never a position list. Staff not yet
recorded — satpam, petugas kebersihan, pustakawan — are added as ordinary roster entries
with an appropriate `Position`, created through the existing master-data screen. Each gets a
`User` account, dormant if the person never signs in. No code enumerates positions,
position categories, or employment types.

**Rationale**: the requester's observation was verified and is correct. `Position` is master
data (`backend/src/academic/master-data/position/`), and `position.seed.ts:26-29` only
supplies initial values through the `SEED_POSITIONS` environment variable — the defaults
already span MANAGEMENT, FINANCE, ADMIN, and ACADEMIC categories, including Staf TU and
Bendahara. So non-teaching staff are already a first-class case, and a hardcoded list would
break the moment someone adds "Satpam" in the UI. FR-056 makes this a requirement and SC-016
tests it by adding a position after release.

The dormant-account consequence is real and worth stating plainly: `Teacher.userId` is
required and unique, so recording a satpam necessarily provisions an account. Making it
nullable would ripple through every join that assumes a user, for the sake of avoiding a row.
Dormant accounts are cheaper and reversible; they should be created without a usable
password and without roles beyond what attendance requires.

**Alternatives considered**:

- *A separate `Employee` model* — rejected as a migration touching 19 academic modules and
  the admission provisioning path, buying this feature nothing.
- *Nullable `Teacher.userId`* — rejected above.
- *Filtering attendance by position category* — rejected; it is precisely what FR-056 forbids.

---

## R11 — Offline queue in the browser: IndexedDB, flush on reconnect

**Decision**: the kiosk holds unsent scans in **IndexedDB**, flushes them in batches on
reconnect, and clears each record only after the server acknowledges its `clientEventId`.
The screen shows a persistent, unmissable indicator of how many scans are waiting.

**Rationale**: SC-013 requires zero loss across four hours — call it 900 scans on a busy
morning. `localStorage` is the wrong tool: synchronous (it blocks the scan handler at
exactly the wrong moment), typically capped near 5 MB, and string-only. IndexedDB is
asynchronous, transactional, and survives a tab crash or a device reboot, which a four-hour
window makes likely rather than hypothetical.

Acknowledging per `clientEventId` rather than per batch means a partially applied batch —
the normal outcome of a connection dropping mid-flush — resolves correctly on the next
attempt, and pairs exactly with the unique constraint from R4.

The visible pending count is not decoration. The realistic failure is nobody noticing the
gate has been offline since Tuesday, and a queue depth on screen is what a petugas can act on.

**Alternatives considered**:

- *`localStorage`* — rejected above.
- *Service worker with Background Sync* — rejected as disproportionate: it needs HTTPS plus a
  service-worker lifecycle for a page that is open continuously anyway.
- *In-memory only* — rejected; a reboot loses the morning.

---

## R12 — QR payload: an opaque random token, not an identifier

**Decision**: the card encodes a single opaque, high-entropy random string
(≥128 bits, URL-safe base64) that resolves server-side to one credential. It encodes no NIS,
no NIP, no name, no user ID, and no URL. Codes are unique, indexed, and permanently retired
on revocation.

**Rationale**: two properties fall out of this that matter more than they first appear.

A found card leaks nothing. A card encoding `NIS 2024001` tells whoever picks it up which
child it belongs to, and school ID cards are lost constantly. An opaque token identifies the
person only to a system that already knows them.

And codes are not guessable or enumerable. Encoding a sequential NIS means a scan of
`2024002` is a valid card for another pupil; 128 bits of randomness makes forging one
infeasible without stealing it.

Retiring codes permanently rather than freeing them for reuse keeps the scan history
unambiguous: a rejected scan of a revoked card in March still resolves to the person it
belonged to, which FR-002 needs to keep history continuous across a replacement.

The spec accepts (in Assumptions) that a static code can be photographed and shared. That is
a supervision problem, not a payload problem, and the mitigation is the staffed gate plus
correctable records. Should it ever need hardening, a rotating code is a change to this
decision alone — the ingest endpoint takes a string and resolves it, so nothing else moves.

**Alternatives considered**:

- *Encode NIS/NIP directly* — rejected on both grounds above.
- *Encode a signed JWT* — rejected: it inflates the QR to a density that scans poorly on a
  laser-printed card, and buys nothing, since the server must hit the database anyway to
  check revocation.
- *Encode a URL* — rejected; it turns a lost card into a link someone taps, and adds nothing
  for an HID scanner that only types text.

---

## Summary of decisions

| # | Decision |
|---|---|
| R1 | Two new domains (`presence/`, `payroll/`) keyed on `userId`; no fifth app; graph acyclic |
| R2 | USB HID barcode scanner first; no scanning library; `qrcode` for printing only |
| R3 | Server-anchored monotonic clock; `occurredAt` and `receivedAt` stored separately |
| R4 | `@@unique([deviceId, clientEventId])` for retries; 60-second window for human repeats |
| R5 | `Decimal(15,2)`; round each line half-up to whole rupiah, then sum |
| R6 | Gate scan never writes per-lesson rows; academic pulls suggestions |
| R7 | Hashed, revocable device tokens via `@DeviceAuth()`; ingest-only routes |
| R8 | `payroll-` joins `ROLE_BYPASS_EXEMPT_PREFIXES`; salary-setting split from run-execution |
| R9 | `presence/` owns `NonWorkingDay`; the calendar import is composed in the browser, keeping the domain graph one-way |
| R10 | Roster-driven eligibility, no position list in code; dormant accounts for non-users |
| R11 | IndexedDB queue, per-`clientEventId` acknowledgement, visible pending count |
| R12 | Opaque 128-bit random token on the card; no personal data, not enumerable |

No `NEEDS CLARIFICATION` items remain from the Technical Context.
