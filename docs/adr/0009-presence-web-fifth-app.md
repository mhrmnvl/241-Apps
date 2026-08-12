# Gate presence and payroll as a fifth application (`presence-web`)

**Supersedes** the "no fifth application" half of [ADR-0007](0007-presence-domain.md). The domain decision in that ADR — presence keys on `userId`, never on `Student` or `Teacher` — is unchanged and is the reason this move cost days rather than weeks.

**Context**: `apps/academic` is the artifact defended in the owner's undergraduate thesis, against a proposal that scopes it to the academic information system. Gate presence and payroll were built afterwards and are in no version of that document. Shipping them inside `academic-web` means the system demonstrated at the defence is not the system the proposal describes — the examiner sees "Presensi" and "Penggajian" in the sidebar of an application whose stated scope covers neither, and the burden of explaining the discrepancy falls on the candidate mid-defence.

That is an argument about the *delivered artifact*, not about code structure. It is worth saying plainly because ADR-0007 weighed a different question — where the code belongs given who operates it — and reached the opposite answer on evidence that has not changed.

**Decision**: add a fifth frontend application, `apps/presence` (package `presence-web`), owning the `presence` and `payroll` feature trees moved out of `academic-web` unchanged. It gets `AppKey.PRESENCE` and its own branding. **The backend is untouched**: `backend/src/presence/` and `backend/src/payroll/` stay where ADR-0007 and ADR-0008 put them, serving both apps from the same process, database, and IAM.

Naming stays `presence` everywhere — folder, package, `AppKey`, permission prefixes. Renaming it to `attendance` was considered and rejected during this move: `academic/attendance` already owns that word for per-lesson attendance, and ADR-0007's naming note explains why the two must stay distinguishable.

## Why ADR-0007's test now points the other way

ADR-0007 rejected a separate app on the audience test borrowed from ADR-0005: the portal earned its own app because its audience was the public, whereas presence serves the same school staff who open SIAKAD daily. That is still true, and it is no longer the only test. The new one is documentary — which application is *the* thesis deliverable — and it has no code-structure equivalent, so it could not have been weighed in ADR-0007.

ADR-0007 also predicted this exact move and priced it: *"Presence is extractable later. If the school ever wants a full SIMPEG as its own application, the domain boundary already exists and the frontend features move with it. That is the option this ADR buys."* This ADR exercises that option, for a reason ADR-0007 did not anticipate.

## Considered Options

- **Leave everything in `academic-web` and explain the extra modules at the defence** — rejected. It makes a documentation problem into a live question with an examiner, at the moment when the candidate has the least room to answer it.
- **Hide the presence and payroll menu sections behind `hiddenMenuKeys` for the defence** — rejected. The routes, the bundle, and the git history would still be there, and a demonstration that depends on a setting nobody switches back is a trap. Concealment is not scope.
- **Move presence but keep payroll in `academic-web`** — rejected. Payroll is driven by monthly presence recaps, so the split would leave the more sensitive of the two modules in the app it least belongs to, still outside the proposal, and now reaching across apps for its inputs.
- **Split the backend as well** — rejected. `presence/` and `payroll/` are already bounded contexts with a one-directional read port, so a second NestJS process would buy nothing but a duplicated auth stack, a second `User` table or a cross-service join, and a distributed session. The module boundary is the part an examiner can be shown; the process boundary is not.
- **Rename `presence` to `attendance` throughout** — rejected, see above. It also reached the Prisma models and five table names, so it would have meant a hand-written `ALTER TABLE ... RENAME` migration against live data for a cosmetic gain.

## Consequences

- **`presence-web` reads academic's HTTP API for the employee roster.** ADR-0007 named this outcome as a cost of a separate app ("reduce to a shell over another app's API") and it is now real, confined to `apps/presence/src/features/lookup`: five read-only calls to `/teachers`, `/students`, `/academic-years`, `/academic-calendar-types`, and `/academic-calendars`. It is an anti-corruption layer, not a shortcut — it declares narrow read models naming only the fields presence uses, so academic can grow its payloads without touching this app. No feature outside `lookup/` may reach academic by any other path — presence-web talks to academic the way any third-party client would.
- **An operator of both apps holds two tabs, but signs in once.** The session is shared — see [ADR-0010](0010-shared-session-across-apps.md), written immediately after this one when the claim originally recorded here ("sessions are per-origin, so staff sign in twice") turned out to be wrong. The tax is tab-switching, not re-authentication, which weakens but does not remove ADR-0007's operational objection.
- **`AppKey` gains a fifth member**, with a migration that only adds the enum value; the `AppSetting` row is seeded, or self-healed on first read by `GetAppSettingUseCase`.
- **Shared platform admin surfaces are deliberately absent.** `presence-web` ships auth, dashboard, profile, and general settings only — no user, role, permission, or audit-log management. Those stay in the apps that already own them, and an operator who needs them opens SIAKAD.
- **The `-web` suffix is load-bearing**, as ADR-0005 recorded: root scripts filter on `*-web`, so an app named otherwise is silently skipped by every quality gate while all of them stay green.
- **`academic-web` no longer depends on `qrcode`**, and its `menuConfig` and router shed the two sections. What remains in that app is what the proposal describes.
