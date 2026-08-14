# Research: Separate the student surface from the management surface

**Date**: 2026-08-14 · **Spec**: [spec.md](spec.md)

Everything below was read from the code in this repository, not recalled. Line
references are to the state of `dev` at `46b74db`.

---

## D1 — Self-service is a separate endpoint with its own permission, not a narrowing of the management one

**Decision**: Each self-service read gets its own route (`.../me`) and its own
permission (`<module>.read-own`). The management route and permission stay
exactly as they are.

**Rationale**: The permission then *is* the boundary. Reading a role's grants
tells you what its holder can see, without opening a use case to find a
conditional. That is what Principle III asks for — "every action is
permission-controlled" — and it is what presence already does:

```
leave.controller.ts:63   @RequirePermissions('leave-requests.read')      → everyone's
leave.controller.ts:72   @RequirePermissions('leave-requests.read-own')  → GET leave-requests/me
```

**Alternatives considered**:

- *Narrow inside the management use case*, the shape already used by
  `get-student-by-id.use-case.ts:16-30`: it checks `isStudent(requester.id)` and
  refuses when the id is not the caller's own. It works, and it is the reason
  `GET /students/:id` is not currently exposed. But it puts authorization in
  scattered conditionals, and `students.read` stops describing what its holder
  may see. The proof is next door: `GET /students` takes `@CurrentUser() _user`
  — deliberately unused — and returns the whole roster to the same permission.
  One route narrowed, its sibling not, and nothing in the permission says which.
- *A single endpoint that changes shape by caller*: rejected for the same
  reason, plus it makes the response type depend on the reader.

**Note for later, out of scope**: `get-student-by-id` remains the odd one out.
Aligning it is a separate change; this feature must not make it worse.

---

## D2 — Which reads are exposed today, and therefore in scope

Verified by reading each controller for whether the injected caller is used:

| Read | Permission | Caller used? | Consequence for a student holding it |
|---|---|---|---|
| `GET /rapors` | `report-cards.read` | no — `findAll(@CurrentUser() user, …)` ignores it | every student's report card: scores, rank, teacher note |
| `GET /rapors/:id` | `report-cards.read` | no | any single report card |
| `GET /academic/attendances` | `attendances.read` | no | every attendance row |
| `GET /academic/attendances/recap` | `attendances.read` | no | the school's recap |
| `GET /academic/attendances/recap/trend` | `attendances.read` | no | the school's trend |
| `GET /students` | `students.read` | **explicitly not** — parameter named `_user` | the whole roster |
| `GET /students/:id` | `students.read` | yes — narrows to self | own record only |
| `GET /student-scores` | `student-scores.read` | to verify at implementation | marks for others |

The seed grants the STUDENT role `students.read`, `attendances.read` and
`report-cards.read` (`iam.seed.ts:176`). Every row above marked "no" is
therefore reachable by a student today.

**Decision**: All of them are in scope for User Story 1. `GET /students` was not
named in the spec's context section and is the one most easily missed, because
its exposure comes from a list rather than a detail.

---

## D3 — New permission codes

**Decision**: `report-cards.read-own`, `student-scores.read-own`,
`attendances.read-own`, `schedules.read-own`, `students.read-own`. Module
segment plural, matching every existing code and the constitution's wording.

**Not** a new exempt prefix. `ROLE_BYPASS_EXEMPT_PREFIXES` is `['portal-',
'payroll-']` (`permission.guard.ts:30`), and the constitution states that adding
one is an amendment rather than a configuration change. A `-own` permission does
not need an exemption: the risk it guards against is a *student* reading widely,
and no student holds a bypass. ADMIN and SUPER_ADMIN passing `-own` freely is
harmless — they already hold the wider permission.

---

## D4 — How the permissions reach an installation that never runs a seed

The catalogue lives in code (`permission-codes.constants.ts:7`,
`SYSTEM_PERMISSIONS`) and reaches the database two ways: the IAM seed reads it,
and `POST /permissions/sync` (`permission.controller.ts:70`, requires
`permissions.manage`) upserts it.

**Decision**: Add the codes to `SYSTEM_PERMISSIONS`, and make the sync run on
application bootstrap in addition to remaining available as an endpoint.

**Rationale**: FR-006 exists because production will be populated through the
UI. Leaving sync as a manual call makes a new permission depend on someone
remembering a step after each deploy — the same class of omission this feature
exists to fix, and the same one that left `system_key` NULL for three weeks
earlier in this repository's history. The sync is an idempotent upsert over a
list of a few dozen rows, the deployment is a single instance, and the
alternative — inserting the codes by migration — would duplicate a
code-defined catalogue into SQL, so the two could disagree.

**Alternatives considered**: migration-only (duplicates the catalogue);
manual-only (a remembered step); both (two sources for one fact).

---

## D5 — What tells the system that someone is a student or a teacher

**Decision**: The record, resolved server-side. `IStudentRepository.findByUserId`
(`student-repository.interface.ts:98`) and `ITeacherRepository.findByUserId`
(`teacher-repository.interface.ts:70`) both already exist, and
`get-student-by-id.use-case.ts` already uses exactly this signal rather than a
role name.

**Consequence for the frontend, and a defect found while establishing this**:
the session type `SessionUser` declares `student?: { id, classroomId, … }` and
`teacher?: { id, … }` (`packages/platform/src/features/auth/types/session.ts:18`),
but `session-identity.dto.ts` returns only `{ id, identifier, isActive, name,
roles, permissions }`. Nothing populates those two fields — not the store, not a
service. The only consumer is `useAcademicInfo.ts:57`:

```ts
const classroomId = user.value?.student?.classroomId
if (!classroomId) return
```

So the student's "today's schedule" on the academic-info screen has never
loaded. It fails silently, which is why it survived.

**Decision**: Do not fix this by populating the session with a student record.
CLAUDE.md is explicit that `/auth/me` is the source of identity, roles and
permissions, and widening it invites authorization decisions to be made from
it. Instead:

- **Screens are offered by permission** — the menu already works this way, and a
  student holding `report-cards.read-own` is exactly the person who should see
  the entry.
- **Data is scoped by record** — each `.../me` endpoint resolves the caller's
  student or teacher record itself and answers about that, returning empty when
  there is none.

Then no screen needs to know what the user "is", and the two dead fields on
`SessionUser` are removed rather than filled.

---

## D6 — How the schedule stops branching on a role name

Today (`useSchedule.ts:28-29`):

```ts
const isStudent = computed(() => roles.value.includes('STUDENT'))
const isTeacher = computed(() => roles.value.includes('TEACHER'))
```

**Decision**: Replace both with permission checks — `can('schedules.read-own')`
for the personal view and `can('schedules.read')` for the classroom picker —
and let a caller holding both see both. The teaching schedule itself comes from
`GET /schedules/me`, which resolves the teaching record server-side.

**Rationale**: `useRoleGuard`'s own doc comment gives the reason ("custom roles
… would silently fail any role-name check"), the school already runs a custom
role (`SARPRAS` exists in the dev database), and the constitution forbids
role-code comparisons outside the guard. A teacher on a school-invented role is
shown the administrator's picker today.

**Alternatives considered**: adding `hasTeacherRecord` to the session — rejected
under D5; keeping the role check and adding the custom roles to it — rejected,
because it fails again the next time the school invents a role, which is the
whole point of letting them.

---

## Open question carried into design

The spec's FR-003 refuses group-shaped reads to a self-authorization, and the
checklist flagged the boundary. Resolution taken here:

**A student's own attendance total is their own row arithmetic and is allowed;
the classroom recap is not.** `GET /academic/attendances/me` therefore returns
that student's days plus their own totals, and `recap` and `recap/trend` remain
management-only. This matches what presence already does for an employee
(`MyAttendanceView` shows own totals; the monthly recap is a separate,
management screen).
