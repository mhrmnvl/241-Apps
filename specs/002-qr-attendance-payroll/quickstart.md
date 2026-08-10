# Quickstart: Validating QR Card Attendance, Leave & Payroll

**Feature**: `002-qr-attendance-payroll` | **Date**: 2026-08-10

A runnable walkthrough proving the feature end to end. Each scenario maps to a user story and
names the success criteria it verifies. This is a validation guide — implementation detail
belongs in `tasks.md`.

## Deploying to production

Two steps, then one click:

```bash
pnpm --filter backend prisma migrate deploy   # schema + reference data
# start the app
```

**No seed runs in production.** The default work pattern and the starting leave
types ship as a *data migration* (`20260810120000_presence_reference_data`), not a
seed, because without a default pattern every scan resolves to `NOT_EXPECTED` —
nobody can be judged late against hours no one defined. Every statement in it is
guarded, so re-running is a no-op. Both are editable afterwards through master
data (leave types, US5) and the work-pattern screens (US4).

Then, **once per release that adds endpoints**: sign in as an account holding
`permissions.manage`, open **Pengaturan → Permissions**, and press **Sync**. That
writes any new permission codes into the database. Skipping it is recoverable but
confusing — the codes cannot be granted to anyone, so `SUPER_ADMIN` works and
everybody else gets a 403 that looks like a bad grant rather than a missed step.

After syncing, remember ADR-0008: `ADMIN` does **not** inherit `payroll-*`. Those
must be granted explicitly, which is the entire point.

## Prerequisites

```bash
pnpm install
pnpm --filter backend prisma:generate
pnpm --filter backend prisma:migrate      # applies presence + payroll migrations
pnpm --filter backend exec tsx prisma/seed.ts
```

Two terminals:

```bash
pnpm --filter backend dev     # http://localhost:3000
pnpm dev:academic             # http://localhost:5173
```

The seed must have created: the default `WorkPattern` (Mon–Thu & Sat 07:00–14:00, Fri
07:00–11:30, grace 10 min), the four `LeaveType` rows, the 40 new permissions, and an `ADMIN`
account **without** any `payroll-*` grant — that absence is what Scenario 7 tests.

No barcode scanner is needed. An HID scanner is a keyboard, so typing a code into the kiosk's
input and pressing Enter is the same event the hardware produces (research R2).

---

## Scenario 1 — A scan records the day · *US1, SC-001, SC-004*

1. Sign in as an account holding `presence-devices.create` and `presence-credentials.create`.
2. **Presensi → Perangkat Gerbang → Tambah**. Name it "Gerbang Utama". **Copy the token — it
   is shown once.**
3. **Presensi → Kartu → Terbitkan**. Issue one card to a teacher and one to a student. Copy
   both codes from the print view.
4. Open `/presensi/kiosk` on a second browser profile. Paste the device token when prompted.
5. Type the teacher's code, press Enter.

**Expect**: name and photo on screen inside 2 seconds, with "Masuk — Tepat waktu" or
"Terlambat N menit" depending on the hour. Repeat with the student's code.

6. Type the teacher's code again **immediately**.

**Expect**: treated as a repeat — no second record, arrival unchanged (FR-006, research R4).

7. Wait past the suppression window, scan again.

**Expect**: check-out recorded, duration shown.

8. Type `INVALID123`.

**Expect**: rejection naming the reason, **no person details shown** (FR-004, R12). Confirm
under **Presensi → Log Pemindaian** that the rejected attempt was retained (FR-003).

---

## Scenario 2 — Offline scans survive · *US1, SC-013*

1. With the kiosk open, stop the backend (`Ctrl+C`).
2. Scan three codes. **Expect**: each is accepted locally and a pending counter appears.
3. Reload the kiosk tab. **Expect**: the counter survives — the queue is in IndexedDB, not
   memory (R11).
4. Restart the backend.

**Expect**: the queue flushes automatically and empties. In **Log Pemindaian**, each scan's
`occurredAt` is the time it was actually taken, while `receivedAt` is the flush time (R3).

5. Flush the same batch twice (DevTools → replay the request).

**Expect**: no duplicate rows — absorbed by `@@unique([deviceId, clientEventId])` (R4).

6. **Depth matters, and is covered automatically.** A four-hour outage on a busy morning
   is order 900 scans, past the server's 500-per-batch cap. Sent as one request that
   comes back a `400`, which the kiosk cannot tell from being offline — so the queue
   would retry forever and lose the morning on the one criterion that promises zero
   loss. `kioskService.flush()` therefore sends in chunks and acknowledges each as it
   lands; `kiosk/__tests__/kioskService.spec.ts` asserts both the chunk sizes and a
   connection dropping between chunks. Steps 1-5 above still have to be walked in a
   browser: what no unit test covers is that the queue survives a tab reload, because
   that is IndexedDB's behaviour rather than ours.

---

## Scenario 3 — Corrections are attributable · *US2, SC-005, SC-010*

1. Sign in with `presence-records.update`.
2. **Presensi → Kehadiran Pegawai**, pick today.
3. On an employee with no scan, **Tambah Manual** → status Hadir. Submit **without a reason**.

**Expect**: refused — reason is required (FR-013).

4. Supply a reason and save. **Expect**: the row shows "Manual" as its source (FR-014).
5. Correct another employee's check-in time with a reason. **Expect**: the row is flagged as
   corrected, and the trail shows previous value, actor, timestamp, and reason (Scenario 2.3).
6. Sign in as that employee and attempt to edit their own record.

**Expect**: `403` (FR-015) — even though they hold `presence-records.update`.

7. As an ordinary teacher holding only `presence-records.read-own`, open **Presensi →
   Kehadiran Saya**.

**Expect**: their own days and monthly totals render. `GET /presence/daily-records` (the full
list) returns `403`, and there is no parameter on the `/me` route that could point it at
someone else (FR-061).

---

## Scenario 4 — Patterns and holidays decide lateness · *US4*

1. **Presensi → Pola Kerja**: create "Piket" ending 16:00; assign it to one employee.
2. **Presensi → Hari Libur** → **Impor dari Kalender Akademik**, pick a year and a holiday
   type. **Expect**: a preview listing the dates before anything is written, then a count of
   imported dates on confirm. The preview is not cosmetic — the import is composed in the
   browser precisely so the backend keeps no `presence → academic` edge (R9).
3. Have the Piket employee scan out at 14:30, and a default-pattern employee do the same.

**Expect**: the Piket employee is flagged as leaving early, the other is not (FR-023).

4. Scan on an imported holiday.

**Expect**: the scan records, but nobody is counted absent for that date and it is excluded
from the attendance rate (FR-026).

5. Edit the Piket pattern's hours, then reopen a **closed** earlier month.

**Expect**: the earlier month's figures are unchanged (FR-027) — each `DailyPresence` records
the pattern it was judged against.

---

## Scenario 5 — Leave suppresses absence · *US5, SC-009, SC-014*

1. As a teacher, **Presensi → Izin & Cuti → Ajukan**: Cuti Tahunan, two future working days,
   with a reason.
2. As the same teacher, attempt to approve it.

**Expect**: `403` — an approver cannot be the requester (FR-029).

3. As Kepala Sekolah, approve it. **Expect**: those two dates show as approved leave, not
   absent, in the teacher's record and monthly recap (FR-030, SC-014).
4. Submit a request exceeding the remaining quota. **Expect**: refused with the shortfall
   stated (FR-032).
5. Submit a request spanning a weekend and an imported holiday.

**Expect**: only working days consume quota and only working days are marked (spec edge case).

6. Have the teacher scan in on an approved leave day.

**Expect**: the scan records and the daily list surfaces the conflict — not discarded (FR-034).

---

## Scenario 6 — Payroll reconciles exactly · *US6, SC-011, SC-015*

1. Sign in with `payroll-components.create` and `payroll-salaries.update`.
2. **Penggajian → Komponen**: create `GAJI_POKOK` (BASE), `TUNJ_JABATAN` (ALLOWANCE), and
   `POT_ALPA` (ATTENDANCE_DRIVEN, driver `ABSENT_DAYS`).
3. Try saving an ALLOWANCE with a `driver` set. **Expect**: `422`.
4. **Penggajian → Gaji Pegawai**: assign amounts to two employees, effective the 1st.
5. **Presensi → Periode** → close last month. If any record lacks a check-out, expect a `409`
   listing them; fix and retry.
6. **Penggajian → Run → Buat** for that month.

**Expect**: a draft listing both employees with gross, deductions, and net.

7. **Sum the payslip lines by hand.**

**Expect**: exactly the stated net — whole rupiah, no residue (FR-046, SC-015). This is the
one check worth doing manually.

8. Correct one employee's attendance for that month, reopen the run, **Hitung Ulang**.

**Expect**: the changed figure, shown against the previous draft (FR-044).

9. Change an employee's base salary effective mid-month, recalculate.

**Expect**: the payslip states which amount was applied and against which effective date
(Scenario 6.3). The superseded assignment still exists.

10. Submit, then approve as Kepala Sekolah. Attempt any edit afterwards.

**Expect**: `409` directing you to an adjustment run (FR-049, FR-050).

11. Create a second run for the same month. **Expect**: it is created as `ADJUSTMENT`, and the
    approved run is untouched.

---

## Scenario 7 — ADMIN cannot read salaries · *US6, SC-012, ADR-0008*

**The security check. Run it every time `permission.guard.ts` changes.**

1. Sign in as the seeded `ADMIN` account (no explicit `payroll-*` grant).
2. Attempt `GET /payroll/runs`, `GET /payroll/components`, `GET /payroll/assignments`, and
   `GET /payroll/payslips/:id`.

**Expect**: `403` on every one. `ADMIN` reaches these only through an explicit grant, because
`payroll-` is exempt from the role bypass.

3. Confirm the same account **can** reach `GET /presence/daily-records` — presence is not
   exempt, and an administrator does administer attendance.
4. As a teacher with only `payroll-payslips.read-own`, open **Penggajian → Slip Gaji Saya**.

**Expect**: their own payslip renders; `GET /payroll/payslips/:otherId` returns `403`.

5. Confirm each refusal produced an `AuditLog` row (FR-052).

---

## Scenario 8 — A new position needs no code change · *SC-016, FR-056*

1. **Master Data → Jabatan → Tambah**: "Satpam", category ADMIN.
2. **Guru & Pegawai → Tambah**: create an employee holding it. An account is provisioned; the
   person need never sign in (research R10).
3. Issue them a card, scan it, and confirm they appear in the daily list and monthly recap.
4. Assign a salary component and include them in a payroll run.

**Expect**: every step works with **no code change and no deployment**. This is the whole of
Q2's answer, tested.

---

## Scenario 9 — Teachers still own the report card · *US3, SC-006, SC-007*

1. Have several students in one class scan in; leave one unscanned; have one scan in late.
2. As their wali kelas, open **Akademik → Kehadiran** for that class and date.

**Expect**: scanned students pre-marked present and visibly flagged as *from the gate,
unconfirmed*; the unscanned student flagged as needing a decision — **not** defaulted to
absent (FR-017, FR-018); the late arrival presented as late with their actual time (FR-021).

3. Change one to Sakit and save. **Expect**: under 60 seconds for a day with few exceptions
   (SC-006).
4. As a guru mapel, mark a gate-scanned student absent for one lesson only.

**Expect**: only that lesson changes (Scenario 3.3).

5. As a teacher who neither supervises nor teaches that class, attempt an edit.
   **Expect**: `403` (FR-019).
6. Open the class recap and the report-card figures.

**Expect**: they use the teacher's values, never the raw scan (FR-020, SC-007).

7. Stop the backend's presence module (or block the port call) and reopen the class view.

**Expect**: the page still loads with every student needing a decision — degraded convenience,
not a degraded record (internal-ports.md, Port 1 failure policy).

---

## Load check — SC-001 and SC-002

Throughput and confirmation latency are claims about a running deployment, so they are
measured rather than asserted:

```bash
node specs/002-qr-attendance-payroll/load-check.mjs   --url http://localhost:3000 --token <device token>   --codes codes.txt --rate 20 --seconds 60
```

`codes.txt` is one card code per line, taken from a **non-production** environment — the
script writes real attendance rows, and a morning of fictional arrivals on real people's
records is not undoable from the UI. It exits non-zero when either criterion misses, so
it can gate a release rather than merely inform one.

SC-002's sizing assumption is **two** gates at the upper roll. Measure that as two
copies running with their own device tokens, not as one copy at double the rate — one
client at 40/min exercises neither device's queue nor the contention between them.

---

## Gates before merge

```bash
pnpm --filter backend validate      # format + lint + typecheck + lint:strict + test + build
pnpm --filter academic-web validate
pnpm typecheck                      # covers packages/* consumed as source
pnpm test                           # includes packages/{shared,platform,master-data}
```

Filter by **package name** (`academic-web`), never by path — pnpm's path filter is
case-sensitive against cwd casing and silently matches nothing on Windows, reporting a green
run that executed no checks.

Also required before merge:

- [ ] A `*.spec.ts` beside every new use case (constitution V — 243 backend specs today)
- [ ] `test/payroll-authorization.e2e-spec.ts` green — the ADR-0008 regression net
- [ ] `src/presence/presence-roster-independence.spec.ts` green — FR-056 asserted, not reviewed
- [ ] `docs/adr/0007-presence-domain.md` and `0008-narrow-admin-bypass-payroll.md` written
- [ ] `.specify/memory/constitution.md` bumped 1.1.0 → 1.2.0 with the Compliance Baseline
      re-surveyed (Principle III's exemption list changed — the constitution requires the
      amendment in the same PR)
- [ ] `CLAUDE.md` updated: two new domains in the backend architecture section
