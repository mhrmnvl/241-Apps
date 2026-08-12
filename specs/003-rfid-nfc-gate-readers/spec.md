# Feature Specification: Physical RFID/NFC Gate Readers

**Feature Branch**: `003-rfid-nfc-gate-readers`

**Created**: 2026-08-11

**Status**: Draft

**Input**: User description: "Audit codebase readiness for physical RFID/NFC/IoT attendance device integration (ESP32 → Wi-Fi → HTTPS → SIAKAD API on VPS), including offline queue and sync."

---

## Context: What This Feature Is Not

This specification was written **after** an audit of the existing `presence/` domain
(feature 002). That audit found that the server side of gate presence is already built
and in production use by a browser kiosk: device registration, device-token
authentication, single and batch scan ingest, idempotency, the server clock anchor, the
offline window, the duplicate window, and the whole downstream daily-presence pipeline.

**This feature adds a physical card reader as a second kind of gate device. It does not
re-open any of that.** The scope below is deliberately narrow: it covers the gap between
"a browser tab scanning a QR code" and "an unattended appliance reading a plastic card",
and nothing else. Anything the audit found already working is listed under
[Out of Scope](#out-of-scope) so that it is not rebuilt.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A person taps their card and is recorded (Priority: P1)

A student or employee arrives at the school gate and holds their card against a reader
mounted by the entrance. The reader beeps or flashes to confirm, and the person walks in.
Their arrival is recorded against the correct date, judged against their work pattern for
lateness, and appears in the same recap and payroll views that scans from the browser
kiosk already feed.

The same tap at the end of the day records a departure.

**Why this priority**: This is the entire point of the feature. Without it there is no
reason to buy hardware. Every other story here exists to make this one safe or
maintainable.

**Independent Test**: Register a reader, bind a card to a test person, tap it, and
confirm a `PRESENT` or `LATE` day appears for that person on today's date. Tap again
after the duplicate window and confirm a departure is recorded. Delivers a working gate
on its own.

**Acceptance Scenarios**:

1. **Given** a person holding a bound, active card and a registered active reader,
   **When** they tap the card for the first time that day, **Then** their arrival is
   recorded on the current school-local date with a lateness judgement from their work
   pattern, and the reader signals success.
2. **Given** the same person has already been recorded as arrived today, **When** they
   tap again later that day beyond the duplicate window, **Then** a departure is recorded
   and any early-leave shortfall is computed.
3. **Given** a person taps twice within the duplicate window because the first beep was
   ambiguous, **When** the second tap is processed, **Then** it is recorded as a
   duplicate and does **not** become a departure.
4. **Given** a card that has been revoked or belongs to an inactive person, **When** it is
   tapped, **Then** the reader signals refusal, no attendance is recorded, and the reader
   reveals nothing about who the card belongs to.
5. **Given** an unrecognised card, **When** it is tapped, **Then** the attempt is still
   written to the scan log as a rejection so that a pattern of unknown cards is visible.

---

### User Story 2 - Binding a physical card to a person (Priority: P1)

A staff member in the office needs to give a new pupil a working card. They open the
credential screen, choose the person, and either (a) hold a blank writable tag against a
desk reader so the person's credential is written onto it, or (b) tap an existing
pre-printed card so its serial is registered against that person. From that moment the
card works at every gate.

When a card is lost, the staff member issues a replacement; the old card stops working
immediately and the person's attendance history shows no gap.

**Why this priority**: P1 alongside Story 1 because a reader with no way to associate a
card with a person is inert. This is the one part of the pipeline the audit found
genuinely missing — the existing credential is a server-minted code with no concept of a
physical card serial.

**Independent Test**: Bind a card to a person through the office screen, then verify the
scan path resolves that card to that person. Can be tested with the existing scan
endpoint before any reader hardware exists.

**Acceptance Scenarios**:

1. **Given** a person with an active credential and a card not yet bound to anyone,
   **When** a staff member binds the card, **Then** subsequent taps of that card resolve
   to that person.
2. **Given** a card already bound to person A, **When** a staff member attempts to bind
   it to person B, **Then** the system refuses and names the conflict rather than
   silently reassigning it.
3. **Given** a person reports their card lost, **When** a staff member issues a
   replacement, **Then** the old card is refused at every gate from that moment and the
   person's expected-days history remains continuous across the replacement.
4. **Given** a person already holds an active credential, **When** a second card is bound
   to them, **Then** the system refuses and directs the operator to replace rather than
   issue a second.
5. **Given** a bound card, **When** an operator views any list or detail screen, **Then**
   the card's secret value is not displayed — only enough to identify which physical card
   it is.

---

### User Story 3 - The gate keeps working when the internet drops (Priority: P2)

The school's connection fails mid-morning. People continue arriving and tapping. The
reader keeps accepting cards, stores each tap locally, and signals a provisional success.
When the connection returns, everything queued is sent and lands with its original
arrival time, not the time the connection came back. Nothing is recorded twice, and
nothing is lost if the reader is power-cycled during the outage.

**Why this priority**: P2 rather than P1 because a gate that only works online still
delivers value on the majority of days — but an outage during the morning rush is
precisely when the most records are at stake, and losing them is not recoverable after
the fact.

**Independent Test**: Register a reader, take the network down, tap a series of cards,
power-cycle the reader, restore the network, and confirm every tap appears exactly once
with its original time.

**Acceptance Scenarios**:

1. **Given** a reader with no connectivity, **When** a card is tapped, **Then** the reader
   signals a provisional acceptance and retains the tap locally.
2. **Given** a reader holding queued taps, **When** connectivity returns, **Then** the
   queued taps are sent oldest-first so an arrival is always applied before the departure
   that followed it.
3. **Given** a queued tap that was already accepted by the server on an earlier partial
   send, **When** it is re-sent, **Then** it is recognised as the same event and does not
   produce a second record.
4. **Given** a reader loses power while holding queued taps, **When** it restarts,
   **Then** the queued taps survive and are still sent.
5. **Given** a queued tap older than the permitted offline window, **When** it is
   eventually sent, **Then** it is refused as stale, recorded as such, and cleared from
   the reader's queue rather than retried forever.
6. **Given** a card that is refused for a reason that will never change — unknown,
   revoked, inactive — **When** the refusal is received, **Then** the reader clears it
   from the queue and does not retry it on the next reconnect.

---

### User Story 4 - Knowing whether a gate is alive (Priority: P2)

An administrator opens the device list and can tell, for each gate, whether it is
currently working. A reader that has lost power, lost Wi-Fi, or been unplugged is visibly
distinguishable from a reader that is simply idle because nobody has arrived in the last
hour.

**Why this priority**: P2. Today a silent gate and an empty corridor look identical,
because a gate is only marked alive when it successfully records a scan. On the day a
gate fails at 06:00, the failure is discovered from missing attendance — after the
morning is already unrecoverable.

**Independent Test**: Register a reader, let it run idle with no taps, and confirm it is
shown as healthy. Unplug it and confirm it becomes visibly unhealthy within the agreed
threshold.

**Acceptance Scenarios**:

1. **Given** a powered, connected reader with no taps for an hour, **When** an
   administrator views the device list, **Then** the reader is shown as healthy.
2. **Given** a reader that has lost power or connectivity, **When** the health threshold
   passes, **Then** the device list shows it as unreachable together with when it was
   last heard from.
3. **Given** a reader holding an unsent queue, **When** an administrator views the device
   list, **Then** the size of that queue is visible, so a gate that is reachable but
   failing to drain is distinguishable from one that is simply offline.
4. **Given** a reader reporting its health, **When** an administrator views its detail,
   **Then** its firmware version and network signal quality are available for diagnosis.

---

### User Story 5 - Commissioning a reader without a keyboard (Priority: P3)

A technician mounts a new reader at a gate. The device has no keyboard and no screen
worth typing on. They need to get its credential onto it and confirm it is talking to the
server, then walk away.

**Why this priority**: P3. It happens a handful of times in the life of the system, and a
sufficiently determined technician can always flash a credential in at build time. But
doing it badly means the gate credential lives in a source file or a shared note.

**Independent Test**: Commission a reader end-to-end without typing its credential into
the device by hand, then confirm the credential is retrievable by nobody afterwards.

**Acceptance Scenarios**:

1. **Given** a newly registered gate, **When** a technician commissions the reader,
   **Then** the reader obtains its credential without that credential being displayed
   more than once or stored anywhere recoverable.
2. **Given** a commissioned reader, **When** an administrator rotates its credential,
   **Then** the reader's old credential is refused immediately and the gate's scan
   history is retained.
3. **Given** a reader is stolen, **When** an administrator deactivates it, **Then** it is
   refused at the next request and cannot read anyone's attendance history — the worst it
   could ever do is create scan noise.

---

### Edge Cases

- **A card is tapped at 06:30 local time**, before the school day starts and before UTC
  midnight has passed in some server configurations. The arrival MUST land on the current
  local school date, not the previous one. This is the single highest-risk edge case in
  the feature; see FR-016.
- **A person taps a card at a gate on a day they are on approved leave.** The tap is
  recorded, the leave stands, and the conflict is surfaced for a human to resolve.
- **Two readers at two gates see the same card within seconds** — someone walks in one
  entrance and out another. The duplicate window absorbs it.
- **A card is bound while the person's credential is being replaced** in another browser
  tab. One of the two operations must lose cleanly rather than leaving a card bound to a
  revoked credential.
- **A reader's local clock is wrong or has been tampered with** at the gate. Recorded
  times must not degrade — the reader is trusted for elapsed duration, never for its
  opinion of what time it is.
- **A reader is tapped continuously by someone holding a card against it**, or a faulty
  reader loops. The gate must not be able to flood the server.
- **A cloned card.** Where card serials are used as the identifier, a serial can be
  copied with commodity hardware. The system must record enough to detect the same person
  appearing at two gates simultaneously, even if it cannot prevent the clone.
- **A queue larger than one request can carry** — a full morning behind a four-hour
  outage. It must drain in bounded pieces rather than failing as one oversized send.
- **A reader is registered but never commissioned**, or commissioned twice. Neither
  should leave a gate that silently accepts nobody.

---

## Requirements *(mandatory)*

### Functional Requirements

#### Card identity and binding

- **FR-001**: The system MUST allow a physical card to be associated with a person's
  existing presence credential, so that presenting the card at a gate resolves to that
  person.
- **FR-002**: The system MUST support both card provisioning modes: writing the
  credential's existing secret onto a writable tag, and registering a read-only card's
  factory serial against the credential. [NEEDS CLARIFICATION: which mode is primary for
  the initial rollout — see Question 1. Both are specified; the answer determines
  sequencing, not scope.]
- **FR-003**: A physical card serial MUST resolve to at most one person at a time. An
  attempt to bind an already-bound serial MUST be refused with an explanation, never
  silently reassigned.
- **FR-004**: A person MUST hold at most one active card at a time. Issuing a second MUST
  be refused and the operator directed to replace instead.
- **FR-005**: Replacing a card MUST refuse the previous card immediately and MUST leave
  the person's record of which dates they were expected unchanged and continuous across
  the replacement.
- **FR-006**: A card's secret value MUST NOT appear in any list or detail response. Only
  a non-secret identifier sufficient to tell one physical card from another may be shown
  after issuance.
- **FR-007**: Where a card serial is used as the identifier, the system MUST treat it as
  a low-entropy, publicly readable, copyable value and MUST NOT rely on it being secret.
- **FR-008**: Binding, replacing, and revoking a card MUST each be attributable to the
  staff member who performed it, with a timestamp.

#### Reader devices

- **FR-009**: The system MUST distinguish a physical reader from a browser kiosk when
  listing gate devices, so that an administrator can tell what kind of appliance each gate
  is.
- **FR-010**: A reader MUST authenticate to the server with a per-device credential that
  is revocable and rotatable independently of every other device and of every user
  account.
- **FR-011**: A reader's credential MUST NOT grant the ability to read any person's
  attendance history. A compromised reader's maximum impact MUST remain the creation of
  scan noise.
- **FR-012**: The system MUST allow a reader to be commissioned without its credential
  being transcribed by hand or stored in a recoverable location.
- **FR-013**: Deactivating or retiring a reader MUST refuse it at its next request while
  retaining its scan history.

#### Recording and time

- **FR-014**: The server MUST remain the sole authority for the recorded time of a scan
  taken while the reader was online.
- **FR-015**: For a scan taken while the reader was offline, the system MUST accept a
  time derived from a server-issued reference plus elapsed duration measured by the
  reader, and MUST reject such a time if it falls outside the permitted offline window or
  implausibly in the future.
- **FR-016**: Every scan MUST be attributed to the calendar date on which it occurred **in
  the school's local time zone**, and lateness MUST be judged against work-pattern times
  interpreted in that same zone, regardless of the time zone the server process runs in.
- **FR-017**: The system MUST retain both when a scan occurred and when the server
  received it, so that a reader with a drifting reference is visible as a widening gap
  rather than as quietly wrong attendance.
- **FR-018**: Every presentation of a card MUST be recorded, accepted or refused, in an
  append-only log that nothing edits.

#### Offline behaviour and synchronisation

- **FR-019**: A reader MUST continue accepting cards and signalling a provisional result
  while it has no connectivity.
- **FR-020**: Taps held by a reader MUST survive a power cycle.
- **FR-021**: The system MUST recognise a re-sent tap as the same event and MUST NOT
  create a second record for it.
- **FR-022**: Queued taps MUST be applied oldest-first so an arrival is never applied
  after the departure that followed it.
- **FR-023**: A refusal that will never change on retry — unknown card, revoked card,
  inactive holder, stale tap — MUST be communicated to the reader as a settled answer
  distinguishable from a transport failure, so the reader clears it rather than retrying
  it forever.
- **FR-024**: A queue larger than one request may carry MUST drain in bounded pieces, each
  acknowledged individually, such that a connection dropping mid-drain still clears what
  arrived.
- **FR-025**: The reader MUST clear a tap from its local store only after the server has
  confirmed that specific tap.

#### Health and observability

- **FR-026**: A reader MUST report that it is alive on a regular interval independent of
  whether anyone has tapped a card, so that an idle gate is distinguishable from a dead
  one.
- **FR-027**: The system MUST surface, per gate: when it was last heard from, whether it
  is currently considered reachable, and how many taps it is holding unsent.
- **FR-028**: The system MUST surface a reader's firmware version and network signal
  quality for diagnosis.
- **FR-029**: The system MUST bound how frequently a single reader can submit, so that a
  looping or jammed reader cannot exhaust server capacity.

### Key Entities

- **Physical Card**: A plastic card or tag carried by a person. Has a factory serial that
  is readable by anyone with a reader and may be cloned. May additionally hold a written
  secret. Bound to exactly one presence credential at a time; a binding has a start, an
  optional end, and the staff member who created it.
- **Presence Credential** *(exists)*: The person's attendance identity and the source of
  truth for which dates they were expected. Already carries a server-minted secret code and
  a replacement chain. A Physical Card attaches to this, rather than replacing it.
- **Gate Device** *(exists)*: A registered appliance at an entrance, holding a rotatable
  credential and a last-heard-from time. Gains a kind (browser kiosk vs physical reader)
  and diagnostic attributes.
- **Device Health Report**: A periodic statement from a reader that it is alive, carrying
  its firmware version, signal quality, and unsent queue depth.
- **Scan** *(exists)*: One presentation of a card at a gate, accepted or refused, carrying
  the reader's own event identifier for idempotency and both an occurred-at and a
  received-at time. Append-only.
- **Daily Presence** *(exists)*: One row per person per date. Unchanged by this feature —
  physical readers feed exactly the same record the browser kiosk does.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A person tapping a card at a reachable gate receives a clear accept or
  refuse signal within 2 seconds, measured at the 95th percentile during the morning
  arrival peak.
- **SC-002**: After a 4-hour connectivity outage covering a full morning arrival period of
  at least 900 taps, 100% of taps are recorded, each exactly once, with their original
  arrival times.
- **SC-003**: A reader that is power-cycled while holding an unsent queue loses zero
  queued taps.
- **SC-004**: A staff member can bind a card to a person and verify it works in under 60
  seconds without leaving the enrolment screen.
- **SC-005**: A gate that stops responding is visibly marked unreachable within 15
  minutes, on a day with no taps at all.
- **SC-006**: 100% of taps occurring between 00:00 and 07:00 school-local time are
  attributed to the correct local calendar date.
- **SC-007**: Reissuing a lost card produces zero days incorrectly counted as absent
  across the replacement.
- **SC-008**: A refused card produces zero information on the reader about who the card
  belongs to.
- **SC-009**: A single misbehaving reader submitting continuously cannot degrade response
  times at other gates.
- **SC-010**: Commissioning a new gate requires zero manual transcription of its
  credential.

---

## Out of Scope

Everything in this list was found by the audit to be **already implemented and working**.
It is recorded here so that it is not rebuilt, re-abstracted, or duplicated.

| Already built — do not rebuild | Where it lives today |
|---|---|
| Gate device registration, listing, update, retire | `presence/device/` |
| Per-device token: issuance, one-time display, SHA-256 hashing, rotation, deactivation | `presence/shared/services/device-token.service.ts` |
| Device authentication guard and its route decorator | `presence/shared/guards/device.guard.ts`, `presence/shared/decorators/device-auth.decorator.ts` |
| Single scan ingest, batch flush, clock anchor endpoints | `presence/scan/presentation/scan.controller.ts` |
| Idempotency on re-sent taps | unique `(deviceId, clientEventId)` on `PresenceScan` |
| Offline window, future-time tolerance, stale rejection | `presence/shared/services/server-clock.service.ts` |
| Duplicate-tap window | `presence/shared/constants/presence.constants.ts` |
| Refusals returned as outcomes rather than HTTP errors | `presence/scan/use-cases/record-scan.use-case.ts` |
| Oldest-first batch ordering and per-event acknowledgement | `presence/scan/use-cases/record-scan-batch.use-case.ts` |
| Append-only scan log with separate occurred-at / received-at | `PresenceScan` model |
| A working reference offline-queue client to copy | `apps/academic/src/features/presence/kiosk/` |
| Arrival/departure judgement, work patterns, holidays, leave, corrections, monthly close | `presence/daily-record/`, `presence/work-pattern/`, `presence/leave/`, `presence/attendance-period/` |
| Downstream consumption by payroll | `IDailyPresenceReadPort` |

Also out of scope for this feature:

- Any change to per-lesson academic attendance, which is a separate concern (ADR-0007).
- Biometric identification of any kind.
- Physical access control — the reader records attendance; it does not open a door.
- Parent notification on arrival.
- A second attendance pipeline. Physical readers feed the existing one or they are wrong.

---

## Assumptions

- **The existing scan contract is reused unchanged.** A physical reader is a new client of
  `POST /presence/scans`, `POST /presence/scans/batch`, and `GET /presence/scans/clock` —
  not a new ingest path. Changing that contract would mean maintaining two.
- **Both device kinds coexist.** The browser kiosk is not retired; a school may run a
  tablet at one entrance and a reader at another.
- **The school operates in a single time zone (Asia/Jakarta, UTC+7).** The audit found no
  time-zone configuration anywhere in the backend and found date bucketing performed on
  UTC calendar parts, which is correct only if the server process itself runs in
  Asia/Jakarta. FR-016 makes this explicit rather than incidental; a VPS defaulting to UTC
  would misattribute every arrival before 07:00 local.
- **Transport security terminates at the VPS reverse proxy.** Readers speak HTTPS; the
  system does not additionally encrypt payloads at the application layer.
- **Readers are unattended appliances at school entrances**, physically reachable by
  anyone passing. They are treated as untrusted hardware that may be stolen or opened.
- **The deployment remains single-school.** No tenant scoping is introduced (Constitution
  Principle III).
- **Card volume is on the order of one thousand active cards**, with a morning arrival peak
  of a few hundred taps concentrated in roughly thirty minutes.
- **Reader hardware is ESP32-class**: Wi-Fi, a few megabytes of flash for a local queue, a
  monotonic millisecond counter, and no reliable battery-backed real-time clock.

---

## Dependencies

- Feature 002 (`specs/002-qr-attendance-payroll`) must remain deployed. This feature
  extends it and does not stand alone.
- The school's gates require mains power and Wi-Fi coverage. Neither is a software
  concern, but both bound SC-005.
- The VPS must be reachable over HTTPS with a certificate the reader firmware can
  validate.

---

## Open Question

### Question 1: Which card provisioning mode is primary?

**Context**: FR-002. The audit found that `PresenceCredential.code` is a server-minted
128-bit opaque token, deliberately random so that a found card reveals nothing about its
holder and cannot be guessed. A physical card can carry that value in two very different
ways, and the choice decides how much needs building.

| Option | Approach | Implication |
|---|---|---|
| A | **Writable tags** — a blank NFC tag is written with the credential's existing code at enrolment; the reader reads the written value | No new identity concept. The reader sends the same `code` the browser kiosk sends today, so the entire backend works unchanged. Keeps the "a found card reveals nothing, and cannot be forged" property intact. Requires buying writable tags and a desk writer, and a tag can be re-written by anyone with a phone unless locked. |
| B | **Read-only card serials** — pre-printed cards are used as-is and their factory serial is registered against the person | Works with cards the school may already own, and with student ID cards that carry a chip. Requires a new binding concept end-to-end. A serial is short, sequential across a production batch, publicly readable, and cloneable with commodity hardware — so it is an identifier, not a secret, and it gives up the anti-forgery property the current design was built for. |
| C | **Both** — writable tags as the default, serial binding as a fallback for cards the school already holds | Largest scope, but the specification above already covers both. Sequencing becomes: ship A first (little or no backend change), add B when a batch of pre-printed cards actually needs supporting. |

**Recommendation**: **C, sequenced** — build A first because it needs almost nothing new,
and treat B as a follow-on. This gets working hardware at the gate in the shortest path
while keeping the option open.
