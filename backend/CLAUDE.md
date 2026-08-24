# Backend — CLAUDE.md

Conventions for `backend/` (NestJS + Prisma). The workspace-wide rules live in
the root `CLAUDE.md`; this file loads when working under `backend/`.

NestJS modular monolith, Prisma ORM, PostgreSQL, RBAC + permission-based
authorization. Authoritative backend docs: `backend/docs/NESTJS-RULES.md` (coding
rules — kept in sync with the code) and `backend/docs/IAM.md` (auth/roles/permissions
design) — read these before making non-trivial backend changes. Earlier planning
artifacts and completed one-off runbooks have been deleted rather than archived: a
stale doc that contradicts the code is worse than no doc. Recover one from git history
if you ever need it; treat the code, this file, and `docs/adr/` as the source of truth.

`portal/` is the fourth frontend's backend domain: seven sibling modules (`post`,
`taxonomy`, `media`, `homepage`, `page`, `agenda`, `gallery`) plus a `shared/`
folder for the response cache and the `@PortalPublic()` decorator. Two things
about it are load-bearing and easy to break:

- **Public visibility is a read-time predicate**, defined once per model in
  `*.where.ts` and composed by every public query. A hand-rolled filter anywhere
  else is a silent leak of unpublished content;
  `test/portal-public-visibility.e2e-spec.ts` is the sweep that catches it.
- **`PortalHtmlModule` must stay last** in `PortalModule`'s imports. Its only
  controller answers `GET *` to serve the SPA shell with injected link-preview
  metadata, and Nest matches controllers in registration order — a module listed
  after it never receives a request.

Top-level domains under `backend/src/`: `core/` (infra: config, database,
decorators, filters, interceptors, logger, storage, health, cache, types — the
guards live with their feature, in `platform/auth/` and
`platform/access-control/permission/`), `shared/` (helpers,
types, dto, validators — no business logic), `platform/` (auth, user, role,
permissions, session, audit-log, profile, school-unit, dashboard, notification,
file, settings, master-data, ...), `academic/` (student, teacher, classroom,
curriculum, subject, schedule, assessment, attendance, report-card, enrollment,
graduation, ...), `inventory/` (asset, circulation, approval, master-data),
`admission/`, `portal/`, `presence/` (credential, device, scan, daily-record,
work-pattern, leave, attendance-period, shared), `payroll/` (component,
assignment, run, payslip, shared). `src/types/` holds ambient declarations only
(`express.d.ts`) — it is not a domain. New modules are registered in `src/app.module.ts`.

`platform/`, `academic/`, `inventory/`, `portal/`, `presence/`, and `payroll/` are
**domains containing sibling modules**;
each module owns the layered layout below. `admission/` is the exception — it is
currently one flat module holding four repository interfaces (wave, announcement,
applicant, application), five controllers, and 31 use cases. That is technical debt,
not a second valid layout: prefer splitting along its existing repository seams over
adding to the flat structure.

`presence/` is gate presence — one row per person per day, keyed on `userId`, fed
by a QR scan at the gate. It is **not** `academic/attendance`, which stays per-lesson
and is untouched by it (ADR-0007). Both `presence/` and `payroll/` are served to
`presence-web`, not `academic-web` (ADR-0009); the split is frontend-only, so these
modules stay here beside the domains they read. Three things there are load-bearing:

- **Credential validity defines a person's expected days.** `NOT_EXPECTED` has three
  distinct causes — a non-working weekday, a holiday, and a date outside the window in
  which the person held a card — and conflating them is what turns "no card yet" into
  "absent" on someone's payslip.
- **The direction is one-way**: `academic/` and `payroll/` read presence through
  `IDailyPresenceReadPort`; presence never reads back, and never imports from
  `academic/`. `presence-academic-direction.spec.ts` is the sweep that holds the line.
- **Nothing branches on a position.** Positions are master data the school edits, so a
  new one must work with no deployment — `presence-roster-independence.spec.ts` proves
  no file under `presence/` or `payroll/` can name one (FR-055, FR-056).

`payroll/` is the only place holding salary. Every permission is prefixed `payroll-`,
and holding an administrative role grants nothing here — nor anywhere else. Only
`SUPER_ADMIN` bypasses the permission check; `ADMIN` is an ordinary role whose grants
decide what it can reach, so an "Admin Akademik" stops at academic (ADR-0011,
superseding the exemption lists of ADR-0006 and ADR-0008). Rounding is per line and then summed, never the reverse; a salary
assignment is superseded rather than overwritten, which is what lets an earlier month
recalculate to its original figures; and an `APPROVED` run is terminal, corrected only
by an adjustment run.

`inventory/` splits its permissions four ways — `inventory-assets`,
`inventory-loans`, `inventory-approvals`, `inventory-master-data` — because
keeping the register, borrowing, and signing off a loan are three different jobs.
A borrower needs `inventory-loans.create` and nothing else that writes. Two things
there are load-bearing:

- **`ApprovalStep.approverRoleCode` holds a role code, not an id.** It is compared
  against the caller's role codes. It was named `approverRoleId` until 2026-08-15,
  which is exactly the kind of name that invites a "fix" to a uuid foreign key —
  after which every approval fails, and a refused approval reads like a permissions
  problem.
- **`ApprovalStep.isMandatory` decides whether an approval ends or travels.** A
  mandatory step is always taken; an optional one is the previous approver's call,
  which is how the inventory administrator chooses per loan whether the head
  teacher also signs. Nothing read this field for the first year it existed, so
  every workflow behaved as though every step were required.

Within a module, the established layering is `presentation/` → `use-cases/` →
`domain/` (+ `infrastructure/`, `dto/`, `constants/`); `academic/student/` is the
reference layout.

There is no `repositories/` folder: the port lives in `domain/interfaces/` and its
Prisma implementation in `infrastructure/persistence/`, wired in the module via
`{ provide: IStudentRepository, useClass: PrismaStudentRepository }`.

Core rules from `NESTJS-RULES.md` (enforced by convention, not by lint):

- Controller → Use case → Repository → Prisma. The use case is injected with the
  abstract `IXxxRepository`, never the Prisma class; controllers and use cases
  never touch Prisma directly.
- One use case = one business responsibility; prefer several small classes
  (`CreateStudentUseCase`, `UpdateStudentUseCase`, ...) over one large `StudentService`.
  `services/` is only for stateless helpers that aren't a business operation.
- The deployment is single-school — there is no `organizationId`, and nothing in
  `academic/` filters by `schoolUnitId`. Scope every query by `deletedAt: null`
  plus the relevant period (`semesterId` / `academicYearId`), falling back to the
  active semester rather than reading across all years.
- Authorization checks permissions (`@RequirePermissions('students.create')` — module
  segment is plural), never role name strings (`user.role === 'ADMIN'`).
- No business logic in DTOs/entities/shared; no inline types or magic
  strings/constants inside use cases — put them in `types/` / `constants/`.
  Narrow projections in a signature (`Promise<{ id: string } | null>`) are fine.
- `*Dto` and `*Input` are two boundaries, not two styles: a DTO is the HTTP
  shape (class-validator + Swagger, under `dto/`), an Input is the repository
  port shape (plain interface, under `domain/interfaces/`). Never let a DTO
  reach a repository, and map DTO → Input field by field in the use case
  rather than forwarding the whole object — structural typing makes the
  pass-through compile, which is how an unwanted field silently reaches
  persistence.
- Throw NestJS HTTP exceptions (`NotFoundException`, `ConflictException`, ...);
  never a bare `throw new Error()`. Custom exceptions are optional and always
  extend a built-in — `academic/student/domain/exceptions/` is the reference.
- Domain events are not used: `@nestjs/event-emitter` isn't installed. A 1:1
  must-succeed consequence is a direct awaited call (ADR-0002).
- API responses use a consistent envelope produced by the global interceptor:
  `{ statusCode, message, data, meta? }` — there is no `success` field. Repositories
  return `{ data, total, page, limit }` and the interceptor folds it into
  `data` + `meta` (see `core/interceptors/response.interceptor.ts`).
- **Reading your own record is a separate permission and a separate route.**
  `report-cards.read` answers about every student; `report-cards.read-own`
  answers about the caller, through `GET /rapors/me`. The permission is then the
  boundary — a role's grants say what its holder may see without opening a use
  case. The caller's identity is applied *after* their query
  (`{ ...query, studentId: resolved }`), or a supplied id overrides it and the
  response looks entirely ordinary. A caller with no matching record gets an
  empty result, returned explicitly, never a read with the filter dropped. A
  cohort-shaped read — a recap, a trend — is refused rather than narrowed.
  Declare `.../me` before its `:id` sibling. If a route does not use the caller,
  it must not ask for them: `no-ignored-caller.spec.ts` enforces that, because a
  `_user` parameter is what made this class of defect invisible. See
  NESTJS-RULES.md.
- **Read only the fields the caller shows.** Every Prisma read that reaches a
  `Profile` uses one of the three shapes in `shared/domain/prisma-selects.ts` —
  name, display (name + avatar file), or roster (name + gender + NIK).
  `profile: true` is a defect, and so is a bare `true` on any relation. The
  domain row must be as narrow as the query: `UserRef<TProfile>` takes the
  projection as a parameter. A row that types its fields as **optional** cannot
  catch a narrowing — that is how a list narrowing once emptied four columns of
  the student spreadsheet while still compiling. A user relation is reached with
  `USER_REF_SELECT` / `USER_DISPLAY_SELECT` / `USER_ROSTER_SELECT`: `include`
  returns every scalar the model owns, and `User` owns `passwordHash`.
  `no-user-scalar-overfetch.spec.ts` enforces it. See NESTJS-RULES.md.
- **The backend is written in English.** Exception and validation messages,
  Swagger summaries and descriptions, log lines, identifiers, and comments — all
  English. Indonesian belongs to the frontend, which owns presentation and can
  translate an English code or message into whatever the screen should say. This
  is also why field names are English: `passingScore`, not `kkm`.

  Three things are exempt, on one principle — text that leaves the system as the
  final thing a person reads, with no frontend in between to translate it:

  - **Rendered documents**: `report-card-pdf.template.ts` prints the rapor handed
    to a parent, and the student import/export spreadsheet's column headers are
    the contract with a file the TU already fills in.
  - **Messages delivered to a person**: password-reset email bodies, and the
    admission notification titles and bodies, which are stored and displayed
    verbatim to the applicant.
  - **Seed data** under `prisma/seeds/`: subject names, positions, and holidays
    are real school data, not interface text.

  Everything else that reads as Indonesian in `backend/src/` is a bug.

Import style: backend uses NodeNext ESM — relative imports include the `.js`
extension (e.g. `from './app.module.js'`) even though the source is `.ts`. A
feature's `index.ts` barrel is its public API, but **never import a NestJS Module
class or a cross-module DTO through a barrel** — import the `.module.js` / the DTO
file directly. A barrel also re-exports the feature's Module + use-cases, so a DTO
that imports it closes an ESM import cycle and crashes boot (`Nest cannot create the
<X>Module instance … the module at index [0] of the imports array is undefined`).
This matches the official NestJS guidance and is spelled out in `NESTJS-RULES.md`.

Prisma schema is split per domain under `backend/prisma/*.prisma` (e.g.
`student.prisma`, `academic.prisma`, `iam.prisma`, `inventory.prisma`,
`admission.prisma`) rather than one monolithic `schema.prisma`.
