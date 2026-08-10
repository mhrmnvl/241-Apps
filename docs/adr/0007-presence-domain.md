# A `presence/` domain keyed on the user, not on the student or the teacher

**Context**: the school needs QR-card gate attendance for **both** students and employees, plus employee working patterns, leave, and payroll. Student per-lesson attendance already exists in `academic/attendance`, is FK-bound to `StudentEnrollment` and `Schedule`, and feeds the report card. Employee attendance does not exist at all — no table, no code.

The requester's original question was whether employee attendance should become a separate application or live in `academic`. That question resolves into two decisions, and only the second is interesting.

The easy one: **no fifth application.** The employee roster lives in `academic/` (`Teacher`, `TeacherPosition`, `Position`, `EmploymentType`), and Principle II forbids app→app imports, so a separate app would either duplicate personnel management or reduce to a shell over another app's API. The people who correct student attendance — wali kelas and guru mapel — already open `apps/academic` daily. ADR-0005 gave the portal its own app because its **audience** was the public with a different auth posture; here the audience is the same school staff, so the same test points the other way.

The hard one is where gate presence lives, because it serves both subjects. Putting it in `academic/attendance` would mix two data shapes — a status per lesson versus a timestamp pair per day — behind one module. Giving it its own domain raises the question this ADR exists to answer: what does it key on?

**Decision**: a new top-level domain `backend/src/presence/`, holding sibling modules `credential`, `device`, `scan`, `daily-record`, `attendance-period`, `work-pattern`, and `leave`. **It keys every record on `userId`, never on `Student` or `Teacher`.**

`Student.userId` (`student.prisma:10`) and `Teacher.userId` (`teacher.prisma:3`) are both required and unique, so every person who could hold a card already has exactly one `User`. A credential points at a user, and presence never asks academic who anyone is.

That single choice is what keeps the dependency graph acyclic:

```
platform/  ←── presence/          presence depends on platform alone
presence/  ←── academic/          academic/attendance reads gate suggestions
presence/  ←── payroll/           payroll reads monthly recaps
academic/  ←── payroll/           payroll reads the employee roster
```

Had presence keyed on `Teacher` and `Student`, `presence → academic` and `academic → presence` would both exist and the two domains would be mutually dependent — the exact shape Principle II exists to prevent.

Two consequences follow directly and are part of this decision rather than details of it:

- **A gate scan writes nothing to `attendances`.** When a teacher opens a class, `academic/attendance` asks presence what the gate saw and renders it as an unconfirmed suggestion; the teacher's save is the only thing that writes. Pull, not push.
- **Credential validity is the "was this person expected today" window.** A person is expected on a date when they held a credential covering it. Presence cannot see `TeacherPosition.hireDate` or enrolment dates without closing the cycle, and card validity is closer to the truth being asserted anyway.

## Considered Options

- **Extend `academic/attendance` to cover employees** — rejected. One module would answer two different questions with two different row shapes, and it would put future salary tables behind the same permission prefix as a wali kelas's daily screen, making ADR-0008's bypass narrowing inexpressible.
- **A fifth application (`apps/presence`)** — rejected above. The cost is concrete and was measured on the last one: package name must end `-web`, aliases in two files, a `validate` chain, auth branding, sidebar, deploy target, CI. ADR-0005 is the precedent for when that is worth paying.
- **A `presence/` domain keyed on `Teacher` and `Student`** — rejected. It is the obvious modelling and it creates the cycle. Every later fix (a mediator module, a shared kernel, an events layer) would be work spent undoing a choice available for free at the start.
- **Presence writing per-lesson attendance rows on scan** — rejected on three grounds. It contradicts FR-022 (existing records untouched) and FR-020 (the teacher's value is authoritative); it would create roughly 400 students × up to 8 lessons of rows every morning, most immediately overwritten; and an offline flush arriving at 10:00 could overwrite a correction the teacher made at 08:00.
- **Reading employment dates from `academic/` for FR-011** — rejected; it closes the cycle for a fact that credential validity already expresses.

## Consequences

- **Presence is extractable later.** If the school ever wants a full SIMPEG as its own application, the domain boundary already exists and the frontend features move with it. That is the option this ADR buys, and the reason the separation happens at the domain layer rather than not at all.
- **`academic/` gains a dependency on `presence/`.** This is a new module edge and is the reason this ADR exists. It is one-directional and read-only, through `IDailyPresenceReadPort`.
- **Card issuance and revocation become operationally load-bearing.** Issuing a card starts someone's attendance history; revoking it ends it. A pegawai who leaves and whose card is never revoked will keep appearing as absent every working day. This is stated in `data-model.md` and must be in the TU's operating instructions — it is the single most likely source of wrong data in this design.
- **Naming is imperfect and deliberately left alone.** `backend/src/presence/` sits beside `backend/src/academic/attendance/`, and both are "absensi" in Indonesian. The alternative — renaming the existing module — touches the report card and buys nothing. `presence/` = gate presence, `academic/attendance` = per-lesson attendance, recorded in `CLAUDE.md`.
- **The roster is still called `Teacher` while holding Bendahara, Staf TU, and soon Satpam.** Renaming it touches 19 academic modules and the admission provisioning path. Presence never names the concept, so this ADR does not force the issue; it remains open debt.
- **Recording a non-teaching employee provisions a `User` they may never sign in with**, because `Teacher.userId` is required and unique. Dormant accounts are the accepted cost; making the column nullable would ripple through every join that assumes a user.

  The operating procedure for a satpam, petugas kebersihan, or pustakawan is therefore:

  1. Add their position through **Master Data → Jabatan** if it does not exist. Nothing in `presence/` or `payroll/` reads a position name, so no code changes (FR-056, asserted by `presence-roster-independence.spec.ts`).
  2. Create the personnel record through **Guru & Pegawai**, which provisions the `User`.
  3. Grant only `presence-records.read-own` — or nothing at all if they will never sign in. A dormant account with no roles can hold a card and be scanned, but cannot open the application.
  4. Issue their card. **This is the step that starts their attendance history**; days before it are `NOT_EXPECTED`, not absent.

  Step 3 is the one worth stating: the account exists because the schema requires it, not because the person is expected to use it. It should be created without a usable password.
- **Enforced, not reviewed.** `presence-academic-direction.spec.ts` asserts no file under `src/presence/` imports from `src/academic/`, and `presence-roster-independence.spec.ts` asserts nothing there names a position or employment type.
