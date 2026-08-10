# Feature Specification: QR Card Attendance, Leave & Payroll

**Feature Branch**: `002-qr-attendance-payroll`

**Created**: 2026-08-10

**Status**: Draft

**Input**: User description: "Disini kan udah ada untuk fitur absensi ya, lebih baik dibuatkan aplikasi terpisah khusus untuk absensi, atau di academic aja, maksudnya saya absensi disini ada yang buat catatan siswa itu mah diinput wali kelas dan guru mapel, dan ada juga untuk absensi pegawai, contohnya masuk jam 7 keluar jam 14, nah ini saya keduanya sih, tapi berbeda, berarti untuk absensi pegawai dipisahkan aja atau disatuin aja di academic?"

**Clarified**: 2026-08-10 — five scope questions answered by the requester:

1. **Students scan too.** The QR card mechanism is the same for students and employees; what differs is who corrects the record — students are corrected by **wali kelas and guru mapel**, employees by **TU and Kepala Sekolah**.
2. **Recording method is a QR code printed on the kartu pelajar / kartu pegawai**, read by a scanning device stationed at the school entrance.
3. **Full scope**: daily presence + izin/sakit/cuti with approval + attendance-driven payroll.
4. **Payroll computes the complete take-home amount** — gaji pokok, all tunjangan, all potongan, down to a net payslip. This system becomes the school's payroll source of truth, not a feed into someone else's spreadsheet.
5. **Every employee is in scope, whatever their position.** Positions are already master data that staff can add themselves, so eligibility for attendance MUST follow the roster, never a hardcoded list of positions. Staff not yet recorded at all — satpam, petugas kebersihan, pustakawan — are recorded as part of this feature.

**What already exists (survey, 2026-08-10)** — this feature adds to it rather than replacing it:

- Per-lesson student attendance already exists and is authoritative for the report card. A record is tied to a student's enrolment and (optionally) a specific timetabled lesson, carries one of PRESENT / ABSENT / LATE / EXCUSED / SICK plus a note, and is entered by wali kelas and guru mapel. It feeds the report card and the class recap.
- **No employee attendance exists** — no record of a working day, no clock-in, no clock-out, nothing.
- The employee roster already exists but is stored under the "teacher" concept. Non-teaching roles are already modelled as positions in the Management, Finance, and Administration categories (Kepala Sekolah, Wakil Kepala Sekolah, Bendahara, Staf TU), alongside academic positions (Guru, Wali Kelas, Guru Piket). Each person carries an employment type, a hire date, and a primary-position flag.
- Roles in the system today: Super Admin, Administrator, Teacher, Student, Parent, Kepala Sekolah, Pendaftar. There is no distinct non-teaching-staff role.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Scan a card at the gate and have the day recorded (Priority: P1)

A student or an employee arrives at the school entrance and holds their card under the scanner at the gate. The device reads the QR code, and within a moment the screen shows their name, their photo, and a clear confirmation: recorded, and whether they are on time or late. On the way home they scan again and the departure time is recorded. Nobody writes anything on paper, and nobody types a list of names.

**Why this priority**: This is the entire premise of the request and the only part that cannot be worked around. Delivered alone, the school has an automatic, timestamped record of who came and when — for both students and employees — which is more than it has today for employees and less error-prone than what it has for students. Every later story reads, corrects, or bills against the data this story produces.

**Independent Test**: Issue a card to one student and one employee, station one scanning device, scan each card at arrival and again at departure, and confirm both people have a dated record showing an arrival time, a departure time, and an on-time/late determination. Confirm an unissued or revoked card is rejected with a message that names the reason.

**Acceptance Scenarios**:

1. **Given** an employee holding a valid, active card, **When** they scan it for the first time that day, **Then** the arrival time is recorded and the screen confirms their identity and whether the arrival is within the expected start time.
2. **Given** an employee who already scanned on arrival, **When** they scan again later the same day, **Then** the departure time is recorded and the screen shows the total time present.
3. **Given** a student holding a valid, active card, **When** they scan on arrival, **Then** a daily presence record is created for that student for that date, and the day's lessons are pre-filled as present pending teacher confirmation.
4. **Given** a card that has been reported lost and revoked, **When** it is scanned, **Then** the scan is rejected, the screen states that the card is no longer valid, and the attempt is retained for review.
5. **Given** a card that is not recognised at all, **When** it is scanned, **Then** the scan is rejected with a clear message and no presence record is created.
6. **Given** a person who scans twice within a few seconds, **When** the second scan arrives, **Then** it is treated as a repeat of the first and does not create a second record or overwrite the arrival with a departure.
7. **Given** a person who never scanned on a working day, **When** the day ends, **Then** their record for that day shows them as not present, distinguishable from a day on which they were not expected.
8. **Given** the gate device temporarily loses its connection, **When** cards are scanned during the outage, **Then** the scans are held and recorded once the connection returns, each keeping the time it actually happened.

---

### User Story 2 - TU and Kepala Sekolah correct and review employee attendance (Priority: P2)

A member of the TU staff opens the day's employee attendance and sees who scanned, who was late, who left early, and who has no record at all. A teacher who forgot their card, and one who spent the morning on an official errand, both need fixing. The TU staff corrects each entry and states why. At the end of the month they open the monthly recap for every employee and hand it to the Kepala Sekolah, who sees the same figures without having to ask for them.

**Why this priority**: A scan-only record is not trustworthy on its own — cards get forgotten, devices fail, and people are legitimately elsewhere. Without a correction path the data is unusable for anything consequential, and the payroll story later depends on it being right. This is also the story that finally gives the school an employee attendance record where none exists today.

**Independent Test**: With a week of scan data in place, have a TU account change one person's arrival time, mark one absent person as on official duty, and add a record for a person who never scanned. Then open the monthly recap and confirm each of the three appears with the corrected value, that every change names who made it and why, and that a Kepala Sekolah account sees the same recap.

**Acceptance Scenarios**:

1. **Given** an employee with no scan for a working day, **When** a TU account records their attendance manually with a reason, **Then** the day counts as attended and the record is marked as manually entered rather than scanned.
2. **Given** a recorded arrival time that is wrong, **When** a TU account corrects it, **Then** the new value takes effect, the previous value is retained, and the change carries the actor, the timestamp, and the stated reason.
3. **Given** a corrected record, **When** anyone views that day, **Then** it is visible that the value was corrected, by whom, and why — without needing to ask.
4. **Given** an employee whose role is not TU or Kepala Sekolah, **When** they attempt to change anyone's attendance including their own, **Then** the action is refused.
5. **Given** a completed month, **When** a TU or Kepala Sekolah account opens the monthly recap, **Then** it shows, per employee, the days attended, days absent, times late, total late minutes, early departures, and days on approved leave.
6. **Given** a monthly recap, **When** it is exported, **Then** the exported figures match what is shown on screen for the same period.

---

### User Story 3 - Wali kelas and guru mapel correct student attendance (Priority: P2)

A wali kelas opens their class for today. The students who scanned at the gate are already marked present, so the list is mostly done. Three names have no scan: one is genuinely absent, one sent a sick note, one arrived late through a side entrance. The wali kelas fixes those three and saves. Later, a guru mapel opens their fourth-period lesson and finds a student who scanned in at the gate but never turned up to the lesson, and marks that student absent for the lesson without disturbing the rest of the day.

**Why this priority**: The gate scan says a student entered the school; it does not say a student attended a lesson. The report card depends on the per-lesson record, and only the teacher in the room knows the truth. This story is what keeps the existing report-card figures correct once the gate scan starts pre-filling them, and it is the reason student attendance stays where teachers already work rather than moving somewhere new.

**Independent Test**: With gate scans recorded for a class, open that class as a wali kelas and confirm scanned students appear pre-marked present and unscanned students appear needing a decision. Change one to sick, save, and confirm the class recap and the report-card figures reflect the change. Then, as a guru mapel, mark a gate-scanned student absent for a single lesson and confirm only that lesson changes.

**Acceptance Scenarios**:

1. **Given** students who scanned at the gate this morning, **When** their wali kelas opens today's attendance, **Then** those students are pre-marked present and clearly shown as pre-filled from the gate rather than confirmed by a teacher.
2. **Given** a student with no gate scan, **When** the wali kelas opens today's attendance, **Then** that student is flagged as needing a decision rather than silently defaulted to absent.
3. **Given** a student pre-marked present from a gate scan, **When** a guru mapel marks them absent for one lesson, **Then** only that lesson changes and the rest of the day is untouched.
4. **Given** a teacher who is neither the wali kelas of a class nor assigned to teach it, **When** they attempt to change that class's attendance, **Then** the action is refused.
5. **Given** a corrected student attendance entry, **When** the class recap and the report-card figures are produced, **Then** they use the teacher's value, never the raw gate scan.
6. **Given** a student who scanned in after the school start time, **When** the day's attendance is prepared, **Then** the student is presented as late rather than present, with the actual arrival time available to the teacher.

---

### User Story 4 - Working hours and the school calendar decide what counts as late (Priority: P3)

The school's standard day runs 07:00 to 14:00, but Friday ends earlier, Ramadan runs on a different timetable, and the Kepala Sekolah's own hours differ from the security guard's. A TU account defines these working patterns once, marks the national and school holidays, and from then on lateness and early departure are judged against the right expectation for each person on each day — not against a single hardcoded time.

**Why this priority**: Story 1 can ship with one school-wide default, and it should. But a single fixed pattern quietly produces wrong numbers the first time a Friday or a holiday arrives, and those wrong numbers become wrong money once payroll is connected. This story is what makes the recap defensible.

**Independent Test**: Define two working patterns with different end times, assign them to two employees, mark one date as a holiday, then confirm that on a normal day each employee is judged against their own pattern, and that on the holiday neither is counted absent.

**Acceptance Scenarios**:

1. **Given** a working pattern with a defined start and end per weekday, **When** it is assigned to an employee, **Then** their lateness and early departure are measured against that pattern.
2. **Given** a date marked as a holiday, **When** the day passes with no scans, **Then** nobody is counted absent for that date and the day is excluded from the attendance rate.
3. **Given** an employee with no pattern assigned, **When** their attendance is evaluated, **Then** the school-wide default pattern applies and this is visible on the record.
4. **Given** a grace period defined for arrival, **When** an employee scans in within it, **Then** they are on time, and outside it they are late by the minutes beyond the grace period.
5. **Given** a working pattern is changed, **When** the change is saved, **Then** previously closed periods keep the figures they were judged with and are not silently recomputed.

---

### User Story 5 - Request izin, sakit, or cuti and have it approved (Priority: P3)

A teacher needs two days off for a family matter. They submit a request stating the type, the dates, and the reason, attaching a letter. The Kepala Sekolah sees it waiting, approves it, and those two days stop appearing as unexplained absences in the teacher's record. A separate request for annual leave is refused because the remaining quota does not cover it. On the student side, a parent's sick note reaches the wali kelas, who records it against the day.

**Why this priority**: Without this, every legitimate absence shows up as a violation and has to be explained by hand every month — and once payroll is attached, an unexplained absence costs someone money. It is P3 rather than P1 because the correction path in Story 2 can absorb the same cases at greater manual cost.

**Independent Test**: Submit a leave request covering two working days, approve it, and confirm those days show as approved leave rather than absent in the requester's record and monthly recap. Submit a second request exceeding the remaining quota and confirm it cannot be approved.

**Acceptance Scenarios**:

1. **Given** an employee submitting a request with a type, a date range, and a reason, **When** it is saved, **Then** it appears to the approver as pending and to the requester as awaiting a decision.
2. **Given** a pending request, **When** the approver approves it, **Then** the covered working days are recorded as approved leave of that type and stop counting as unexplained absence.
3. **Given** a pending request, **When** the approver rejects it with a reason, **Then** the requester sees the rejection and the reason, and the days revert to their ordinary treatment.
4. **Given** a leave type with an annual quota, **When** a request would exceed the remaining quota, **Then** it cannot be approved and the shortfall is stated.
5. **Given** an approved leave covering a date, **When** the person nevertheless scans in on that date, **Then** the scan is recorded and the conflict is surfaced for review rather than silently discarded.
6. **Given** a request awaiting a decision, **When** the requester withdraws it before a decision, **Then** it closes as withdrawn and consumes no quota.
7. **Given** a student sick note, **When** the wali kelas records it for a date, **Then** that date is treated as an excused absence in the student's record and in the report-card figures.

---

### User Story 6 - Run monthly payroll from attendance (Priority: P4)

At month end, a TU account starts the payroll run for the month. The system assembles each employee's gaji pokok and tunjangan, pulls their attendance for that month, applies the attendance-driven allowances and potongan, and produces a draft showing every person's net take-home. The TU staff reviews it, fixes one employee whose attendance was corrected late, and submits it. The Kepala Sekolah approves the run, after which the figures are locked and each employee can open their own payslip and nobody else's.

**Why this priority**: This is the furthest downstream and by far the most sensitive. It is worthless until attendance is trustworthy — which is stories 1 through 5 — and it is the only part of the feature that holds every employee's salary, so it must be built last and gated hardest. Because this system becomes the school's payroll source of truth, an error here is not a wrong report; it is someone paid the wrong amount.

**Independent Test**: With one closed month of attendance for two employees, give each a base salary, one fixed allowance, and one attendance-driven deduction, run payroll, and confirm each employee's net follows from their own attendance and that the components sum exactly to the stated net. Approve the run and confirm it can no longer be edited, that each employee sees only their own payslip, and that an account without payroll authorisation sees none.

**Acceptance Scenarios**:

1. **Given** a month with attendance recorded, **When** a payroll run is created for it, **Then** each employee appears with their base salary, their allowances, their attendance summary for that month, and the resulting gross, deductions, and net.
2. **Given** an attendance-driven component defined as a rate per occurrence, **When** the run is produced, **Then** the amount follows from the employee's own count for that month and the calculation is shown, not just the total.
3. **Given** an employee whose base salary changed effective the 15th, **When** a run covering that month is produced, **Then** the run states which amount it applied and the superseded amount remains on record.
4. **Given** an account authorised to run payroll but not to set salaries, **When** they attempt to change an employee's base salary or component amount, **Then** the change is refused while the run itself remains available to them.
5. **Given** a produced payslip, **When** its components are summed, **Then** the total equals the stated net exactly, with no rounding discrepancy.
6. **Given** a draft payroll run, **When** an employee's attendance for that month is corrected, **Then** the draft can be recalculated and the change is visible against the previous draft figures.
7. **Given** an approved payroll run, **When** anyone attempts to edit it, **Then** the change is refused and a correction must be issued as an adjustment in a later run.
8. **Given** an approved run, **When** an employee opens their payslip, **Then** they see their own components, attendance summary, and net amount, and no other employee's figures.
9. **Given** an account without payroll authorisation, **When** they attempt to open any payroll run, payslip, or salary component, **Then** access is refused and the attempt is retained for review.
10. **Given** a month for which a run is already approved, **When** a second run is created for the same month, **Then** it is identified as an adjustment run rather than replacing the approved one.

---

### Edge Cases

**Scanning and devices**

- A person scans out before ever scanning in — the record shows a departure with no arrival and is flagged for correction rather than being discarded or treated as an arrival.
- A person forgets to scan out — the day shows an arrival with no departure and is flagged; it is not silently treated as a full day or as an absence.
- Two people scan within the same second on one device, or the same card is scanned on two devices at once — each scan is attributed correctly and the duplicate is resolved as a repeat, not a departure.
- The gate device's clock is wrong — recorded times must come from a trusted source, not from whatever the device believes.
- The device is offline for a whole morning — queued scans are recorded with their real times once the connection returns, and the queue is not lost if the device restarts.
- Someone photographs another person's card QR and scans the picture — the system cannot detect this on its own; the gate is supervised and the record remains correctable by the wali kelas or TU.
- A card is lost, revoked, and reissued — the old code stops working immediately, the new one works, and the person's history stays continuous across both cards.
- A person holds two cards, or an employee is also a parent of an enrolled student — each card resolves to exactly one role for scanning purposes.

**Attendance treatment**

- A student scans in and then goes home sick at 09:00 — the departure is recorded, and the teacher can mark the remaining lessons excused without contradicting the scan.
- A student was present but the gate device was down that morning — the teacher's per-lesson record governs, and the missing scan does not create a false absence in the report card.
- An employee is on official duty away from school for a full day — recorded as attended-elsewhere, distinct from both present and absent, and treated correctly in the recap and payroll.
- A working day is cancelled mid-day (early dismissal, emergency) — nobody is counted as leaving early for that date.
- A person joins or leaves employment mid-month — days outside their employment period are not counted as absences.
- A student is enrolled mid-semester or graduates mid-year — the same boundary treatment applies.

**Leave and approval**

- A leave request spans a holiday or a weekend — only working days consume quota and only working days are marked as leave.
- The only approver is the person requesting the leave (the Kepala Sekolah's own leave) — a request cannot be approved by its own requester.
- A leave request is approved retroactively for a date already recorded as absent — the day is reclassified and any recap for an open period reflects it.
- A leave request is approved for a date inside a payroll month that is already approved — the payroll cannot change; the correction is carried as an adjustment.

**Employee coverage**

- A new position is added through master data after this feature ships — its holders become eligible for attendance, leave, and payroll immediately, with no code change and no deployment.
- An employee never signs in and has no reason to (satpam, petugas kebersihan) — their attendance is captured by scan and corrected by TU, and their payslip reaches them by whatever means the school already uses.
- A position is renamed or retired while people still hold it — their attendance history and payroll remain intact and attributable.

**Payroll**

- An employee has no attendance at all for the month (long leave, new hire) — the run must produce a defensible figure rather than a blank or a crash.
- An employee has no salary components assigned when a run is produced — they are surfaced as unconfigured and blocking, never silently paid zero.
- An employee joins or leaves employment mid-month — the run states plainly how the partial month was treated rather than paying a full month by default.
- A base salary or component rate changes mid-month — the run states which amount it applied and against which effective date.
- Components sum to a fraction of a rupiah — one stated rounding rule applies, and the components still reconcile exactly to the net.
- Attendance is corrected after the run is approved — the approved run is immutable and the difference is carried forward.

## Requirements *(mandatory)*

### Functional Requirements

**Cards and identity**

- **FR-001**: System MUST issue a card credential carrying a scannable code to any student or employee, and MUST resolve a scanned code to exactly one person.
- **FR-002**: System MUST allow a card to be revoked and replaced, MUST reject a revoked code immediately, and MUST keep the person's attendance history continuous across a card replacement.
- **FR-003**: System MUST retain every scan attempt, including rejected ones, with the code presented, the device, the time, and the reason for rejection.
- **FR-004**: System MUST NOT create or alter a presence record from a scan it cannot resolve to an active card.

**Recording presence**

- **FR-005**: System MUST record, per person per date, an arrival time, a departure time, and a derived day status.
- **FR-006**: System MUST treat the first accepted scan of a person's day as the arrival and a later accepted scan as the departure, and MUST treat a repeat scan within a short interval as the same event rather than a new one.
- **FR-007**: System MUST confirm each accepted scan to the person at the device, identifying them by name and photo and stating whether they are on time or late.
- **FR-008**: System MUST reject a scan with a stated reason when the code is unknown, revoked, or belongs to an inactive person.
- **FR-009**: System MUST record scans taken while the device is disconnected and MUST persist them with the time the scan occurred, not the time it was received.
- **FR-010**: System MUST derive recorded times from a trusted clock rather than trusting a device's own clock.
- **FR-011**: System MUST distinguish a working day with no attendance (absent) from a day on which the person was not expected (holiday, non-working day, outside their employment or enrolment period).

**Correcting employee attendance**

- **FR-012**: System MUST allow TU and Kepala Sekolah to create, correct, or annotate any employee's attendance for a date.
- **FR-013**: System MUST require a reason for every manual correction, and MUST retain the previous value, the actor, and the time of the change.
- **FR-014**: System MUST mark each attendance value as scanned or manually entered, and MUST show this wherever the value is displayed.
- **FR-015**: System MUST prevent an employee from altering their own attendance record.
- **FR-016**: System MUST support recording an employee as on official duty away from school, distinct from both present and absent.

**Correcting student attendance**

- **FR-017**: System MUST pre-fill a student's per-lesson attendance for the day from their gate scan, and MUST mark the pre-filled value as unconfirmed until a teacher saves it.
- **FR-018**: System MUST allow a wali kelas to set any of their class's students' attendance for a date, and a guru mapel to set attendance for the lessons they are assigned to teach.
- **FR-019**: System MUST refuse an attendance change from a teacher who is neither the wali kelas of the class nor assigned to teach the lesson.
- **FR-020**: System MUST treat the teacher-confirmed per-lesson record, never the raw gate scan, as the value used for the class recap and the report card.
- **FR-021**: System MUST make a student's actual gate arrival time visible to the teacher when it is later than the school start time.
- **FR-022**: System MUST NOT alter, hide, or migrate existing per-lesson student attendance records already captured before this feature.

**Working patterns and calendar**

- **FR-023**: System MUST support defining working patterns that state an expected start and end time per weekday, and MUST allow assigning a pattern to an employee.
- **FR-024**: System MUST apply a school-wide default working pattern to any employee with no pattern assigned, and MUST make that fallback visible on the record.
- **FR-025**: System MUST support an arrival grace period, and MUST measure lateness as the minutes beyond that grace period.
- **FR-026**: System MUST recognise holidays and non-working days, and MUST exclude them from absence counting and attendance rates.
- **FR-027**: System MUST NOT retroactively recompute the figures of a period already closed when a working pattern or holiday is later changed.

**Leave**

- **FR-028**: System MUST allow an employee to submit a leave request stating a type, a date range, a reason, and an optional supporting document.
- **FR-029**: System MUST route each request to an authorised approver, and MUST prevent a request from being approved by its own requester.
- **FR-030**: System MUST record an approved request's working days as approved leave of that type, and MUST stop those days counting as unexplained absence.
- **FR-031**: System MUST record a rejection with its reason and MUST make both visible to the requester.
- **FR-032**: System MUST enforce an annual quota per leave type where one is defined, MUST count only working days against it, and MUST state the shortfall when a request exceeds it.
- **FR-033**: System MUST allow a requester to withdraw a request before a decision, consuming no quota.
- **FR-034**: System MUST surface, rather than discard, a scan that occurs on a date covered by approved leave.
- **FR-035**: System MUST allow a wali kelas to record a student's excused absence (izin or sakit) for a date, with a reason and an optional supporting document.

**Recaps**

- **FR-036**: System MUST produce a monthly recap per employee showing days attended, days absent, count and total minutes late, early departures, days on official duty, and days on approved leave per type.
- **FR-037**: System MUST produce a student attendance recap per class and per student for a period, consistent with the figures used by the report card. *This capability already exists and is not rebuilt here; the requirement is that it keeps producing the same figures once gate suggestions begin pre-filling the teacher's screen.*
- **FR-038**: System MUST allow a recap to be exported, and the exported figures MUST match those displayed for the same period.
- **FR-039**: System MUST allow a period to be closed, after which its recap figures are fixed.

**Payroll**

- **FR-040**: System MUST compute each employee's complete take-home amount — base salary, all allowances, all deductions, and the resulting net — and MUST be the school's authoritative record of that figure rather than a feed into an external calculation.
- **FR-041**: System MUST support defining salary components, each being a base salary, a fixed allowance, an amount driven by an attendance count at a stated rate, or a deduction.
- **FR-042**: System MUST support assigning components to an employee with an effective date, MUST retain superseded assignments rather than overwriting them, and MUST use the assignment in force during the month being run.
- **FR-043**: System MUST treat setting or changing an employee's salary amounts as a capability distinct from running payroll, so that the person who calculates a run need not be the person who decides what anyone is paid.
- **FR-044**: System MUST produce a payroll run for a month containing, per employee, their applicable components, their attendance summary for that month, and the resulting gross, deductions, and net.
- **FR-045**: System MUST show how each attendance-driven amount was derived, including the count and the rate used.
- **FR-046**: System MUST express all amounts in whole rupiah and MUST apply one stated rounding rule consistently, so that the sum of the components always equals the stated net.
- **FR-047**: System MUST produce a payslip per employee per run showing their identity and period, each component with its amount, the attendance summary the run used, and the gross, total deductions, and net.
- **FR-048**: System MUST allow a draft run to be recalculated after attendance corrections, and MUST show the difference from the previous draft.
- **FR-049**: System MUST require approval by an authorised approver before a run is final, and MUST make an approved run immutable.
- **FR-050**: System MUST handle a correction to an approved month as an adjustment carried in a later run, never as an edit to the approved run.
- **FR-051**: System MUST restrict salary components, salary assignments, payroll runs, and other employees' payslips to explicitly authorised accounts, and MUST allow an employee to see their own payslip only.
- **FR-052**: System MUST retain every access and attempted access to salary data, so that an unauthorised attempt is reviewable after the fact.
- **FR-053**: System MUST retain who created, recalculated, and approved each run, and when.
- **FR-054**: System MUST produce a defensible figure for an employee with no attendance in the month rather than failing or producing a blank.

**Employee coverage**

- **FR-055**: System MUST make every person on the employee roster eligible for attendance, leave, and payroll regardless of their position.
- **FR-056**: System MUST NOT gate any capability in this feature on a hardcoded list of positions, position categories, or employment types. Adding a position through the existing master data MUST make its holders fully eligible with no code change and no deployment.
- **FR-057**: System MUST support recording employees who are not currently in the system at all — satpam, petugas kebersihan, pustakawan and similar — and MUST issue them cards on the same terms as any other employee.
- **FR-058**: System MUST support an employee who never signs in, whose attendance is captured by scan and corrected by TU, without requiring them to use the application.

**Authorisation and traceability**

- **FR-059**: System MUST express every capability in this feature as a distinct permission — separately for student attendance, employee attendance, leave approval, salary setting, and payroll execution — rather than inferring authority from a role name.
- **FR-060**: System MUST retain an attributable record of every change to an attendance value, leave decision, salary assignment, and payroll run: who, when, from what, to what, and why.

**Self-service visibility**

- **FR-061**: System MUST allow a person to view their own daily attendance and monthly totals, and only their own — with no way to point the same view at another person. This is what lets someone notice a missing scan on the day it happened rather than at month end, when correcting it is far more expensive.

### Key Entities

- **Card Credential**: a scannable code printed on a kartu pelajar or kartu pegawai. Belongs to exactly one person, has an issue date and a status (active, revoked, replaced). Revoking one and issuing another does not break the person's history.
- **Scan Event**: one presentation of a code at a device — the code, the device, the moment it happened, whether it was accepted, and if not, why. Retained including rejections.
- **Gate Device**: a registered scanning station at an entrance, with a location and a last-seen time, so an outage is visible rather than inferred from missing data.
- **Daily Presence Record**: one person, one date — arrival, departure, derived status, minutes late, and the source of each value (scanned or manually entered). The unit that recaps and payroll read.
- **Attendance Correction**: the trail behind a Daily Presence Record or a per-lesson record — previous value, new value, actor, time, reason.
- **Per-Lesson Student Attendance** *(exists today)*: a student's status for a date and optionally a specific lesson, entered by wali kelas or guru mapel, authoritative for the report card. Now seeded by the gate scan and still owned by the teacher.
- **Working Pattern**: expected start and end per weekday, plus an arrival grace period. Assigned to an employee; a school-wide default applies otherwise.
- **Non-Working Day**: a date on which attendance is not expected — national holiday, school holiday, or a cancelled day.
- **Leave Type**: izin, sakit, cuti tahunan, dinas luar and similar — each with whether it consumes a quota, whether it requires a document, and how it is treated in the recap.
- **Leave Request**: requester, type, date range, reason, optional document, approver, decision, decision reason, and the working days it covers.
- **Leave Balance**: remaining quota per employee per leave type per year.
- **Attendance Period**: a month or comparable range that can be closed, after which its recap figures are fixed.
- **Salary Component**: a named element of pay — base salary (gaji pokok), fixed allowance (tunjangan tetap), an amount driven by an attendance count at a rate, or a deduction (potongan) — with the period it applies to.
- **Employee Salary Assignment**: which components apply to which employee, at what amount, effective from when. Superseded assignments are retained, so a run for an earlier month uses the amount that was actually in force then.
- **Payroll Run**: a month, a status (draft, submitted, approved), the actors behind each transition, and whether it is an original run or an adjustment.
- **Payslip**: one employee within one run — components applied, attendance summary used, gross, deductions, net, and the derivation of each attendance-driven amount.
- **Salary Data Access Record**: who opened or attempted to open salary components, runs, or payslips, and when — the trail that makes an unauthorised attempt reviewable.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A person scanning at the gate sees a confirmation naming them within 2 seconds of presenting the card.
- **SC-002**: A single gate device sustains at least 20 accepted scans per minute. At the school's upper size — around 660 students and staff — that is 33 minutes through one gate and 17 through two, so **two devices are the sizing assumption**, and a single device is only sufficient at the lower end of the roll.
- **SC-003**: Within one month of use, at least 95% of employee working days are recorded by scan alone, with no manual entry.
- **SC-004**: The school holds a complete daily attendance record for every employee, covering arrival and departure — a record that does not exist at all today.
- **SC-005**: TU spends under 15 minutes per day handling attendance corrections for the whole staff, replacing the manual compilation this feature removes.
- **SC-006**: A wali kelas completes a class's daily attendance in under 60 seconds on a day with no more than three exceptions, because scanned students arrive pre-filled.
- **SC-007**: Report-card attendance figures after this feature match teacher-confirmed records in 100% of sampled cases — a gate scan alone never changes a report card.
- **SC-008**: A monthly employee attendance recap for the whole staff is produced in under 5 minutes, against the multi-day manual compilation it replaces.
- **SC-009**: 90% of leave requests receive a decision within 2 working days of submission.
- **SC-010**: 100% of manual attendance changes, leave decisions, and payroll approvals carry an identifiable actor and a stated reason.
- **SC-011**: A complete monthly payroll run for all employees is produced, reviewed, and approved in under 30 minutes.
- **SC-012**: Zero incidents of an account viewing salary data it is not authorised to see, verified by review of access attempts.
- **SC-013**: A gate device that loses its connection for up to 4 hours loses zero scans once reconnected.
- **SC-014**: No unexplained absence appears in a monthly recap for a day covered by an approved leave request.
- **SC-015**: On 100% of payslips produced, the listed components sum exactly to the stated net, with no unexplained rounding difference.
- **SC-016**: A position added through master data after release requires zero code changes and zero deployments before its holders can scan, request leave, and appear in a payroll run — verified by adding one and using it.
- **SC-017**: Within one month of rollout, every employee of the school — teaching and non-teaching, including those who never sign in — holds a card and has a daily attendance record.

## Assumptions

**Delivery shape — the requester's original question, answered**

- **Student attendance stays where it is; employee attendance becomes a new, separate domain.** The two are different subjects with different data shapes — a status per lesson feeding a report card, versus a pair of timestamps per day feeding a recap and a payslip — so they are separated at the domain level. They are *not* separated into different applications: the people who correct student attendance (wali kelas, guru mapel) already work in the academic application daily, the employee roster already lives there, and applications in this workspace may not read each other's data. A dedicated attendance application is therefore assumed **not** to be created for this feature. The QR gate scan is a third, shared concern serving both subjects.
- Whether this eventually becomes its own application — a full SIMPEG once payroll, contracts, and personnel records grow — is a later decision, not this one. The domain separation assumed here is what makes that split inexpensive if it is ever taken. The concrete structural decision is deferred to the planning phase and requires an architecture decision record.

**Scanning**

- The QR code on a card is a static identifier printed once, not a rotating code, so cards can be printed for the life of the card. This is assumed to be acceptable because the gate is supervised and every record is correctable; a rotating code is a possible later hardening and is out of scope here.
- The gate is staffed while scanning is in progress. The system does not attempt to detect a person scanning a photograph of someone else's card.
- The scanning device is a general-purpose device running the school's own scanning screen. **This release supports a barcode scanner attached to a computer, which the operating system treats as a keyboard.** Camera-based scanning on a tablet is deliberately deferred — it is slower per person in a morning queue, depends on light, and needs a camera permission that must survive reboots. The scan interface accepts a code string and does not care how the code was read, so adding the camera later changes one screen and nothing else. Integration with a proprietary commercial attendance machine and its vendor SDK is out of scope.
- One or more entrances are covered; the design does not assume exactly one device.

**Attendance treatment**

- A gate scan for a student establishes that the student entered the school, not that they attended any lesson. It pre-fills, and the teacher confirms. Per-lesson attendance remains the authority for the report card. This follows from the requester's statement that guru mapel correct student attendance.
- The default working day is 07:00 to 14:00 school-wide, used until working patterns (User Story 4) are configured.
- Existing per-lesson attendance data is untouched by this feature.

**Employees and roles**

- "Pegawai" means every school employee, teaching and non-teaching, with no exceptions by position. The system currently stores non-teaching staff (Staf TU, Bendahara) under the same record type as teachers, distinguished by their position; this feature assumes that arrangement continues rather than introducing a separate employee record type.
- Positions are master data the school maintains itself, not a fixed list in the code. Eligibility for attendance, leave, and payroll therefore follows the employee roster, and a position added next year works without anyone touching the system — this is a requirement (FR-056), not merely an expectation.
- Every employee record today requires a linked user account. Recording satpam, petugas kebersihan, and pustakawan therefore means provisioning accounts for people who may never sign in. This is a known consequence of the current data shape; whether to relax it, or simply to create dormant accounts, is a planning decision.
- TU staff and Kepala Sekolah are identified by explicit permissions granted to them, not by matching a role name, consistent with the project's authorisation rules.
- There is no distinct non-teaching-staff role today; whether one is added is a planning decision, not a requirement of this feature.
- The naming mismatch is acknowledged: the roster is called "teacher" while it already holds Bendahara and Staf TU, and will hold satpam and petugas kebersihan. Whether to rename the concept is a planning decision with migration cost, out of scope for this specification.

**Scope boundaries**

- Parent-facing visibility of a child's attendance, and push or message notification of a late arrival or absence, are out of scope for this feature.
- Biometric capture (fingerprint, face) is out of scope.
- Payroll computes the complete take-home amount and produces payslips, but does not move money. Bank transfer and payment execution are out of scope.
- Statutory calculation rules — PPh 21 brackets, BPJS contribution formulas — are not modelled. Where such a deduction applies, it is entered as an ordinary deduction component with an amount the school determines. Building the tax and BPJS calculation engines, and their reporting, is out of scope.
- The deployment remains single-school. No multi-campus or multi-tenant scoping is introduced.

**Dependencies**

- Requires the existing employee roster, position, and employment-type data.
- Requires the existing student enrolment, class, and timetable data, and the existing per-lesson attendance function.
- Requires the existing academic calendar as the source of school holidays and non-working days.
- Requires the existing permission-based authorisation and file-attachment capabilities for leave documents.
- Requires cards to be physically produced and distributed to every student and employee before the gate scan can be relied on; a rollout period during which manual entry carries the load is assumed.
