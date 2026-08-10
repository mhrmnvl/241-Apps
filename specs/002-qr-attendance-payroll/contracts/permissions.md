# Contract: Permissions

**Feature**: `002-qr-attendance-payroll`

42 new codes appended to `backend/src/platform/access-control/permission/constants/permission-codes.constants.ts`
(202 today → 244). Module segments are plural, per the constitution. After adding them, run
`POST /permissions/sync` or reseed.

---

## Presence permissions — subject to the normal `ADMIN` bypass

An `ADMIN` legitimately administers attendance, so these behave like every existing
permission: `SUPER_ADMIN` and `ADMIN` pass by role, everyone else needs a grant.

| Module | Codes |
|---|---|
| `presence-credentials` | `.create` `.read` `.update` `.delete` |
| `presence-devices` | `.create` `.read` `.update` `.delete` |
| `presence-scans` | `.read` |
| `presence-records` | `.create` `.read` `.update` `.read-own` |
| `presence-periods` | `.close` |
| `work-patterns` | `.create` `.read` `.update` `.delete` |
| `non-working-days` | `.create` `.read` `.update` `.delete` |
| `leave-types` | `.create` `.read` `.update` `.delete` |
| `leave-requests` | `.create` `.read` `.approve` `.read-own` |

**30 codes.**

Three are not CRUD and are worth naming:

- `presence-records.read-own` lets a person open their own attendance and nobody else's,
  served by `GET /presence/daily-records/me`. It is a real permission rather than an implicit
  right so that a school which does not want staff self-checking their own lateness can
  simply not grant it.

- `presence-records.update` is the correction capability. FR-015 additionally forbids editing
  one's own record, enforced in the use case against the authenticated user — a permission
  cannot express "anyone but yourself".
- `presence-periods.close` is separated from `presence-records.update` because closing a month
  fixes payroll's inputs. Whoever corrects daily attendance should not also be able to declare
  the month final.

---

## Payroll permissions — **exempt from the `ADMIN` bypass** (ADR-0008)

`payroll-` joins `portal-` in `ROLE_BYPASS_EXEMPT_PREFIXES` (`permission.guard.ts:25`).
Holding `ADMIN` grants **nothing** below; each must be granted explicitly.
`SUPER_ADMIN` retains break-glass.

| Module | Codes |
|---|---|
| `payroll-components` | `.create` `.read` `.update` `.delete` |
| `payroll-salaries` | `.read` `.update` |
| `payroll-runs` | `.create` `.read` `.update` `.approve` |
| `payroll-payslips` | `.read` `.read-own` |

**12 codes.**

### The split that matters

`payroll-salaries.update` (deciding what a person is paid) is separate from
`payroll-runs.create` (calculating the month). FR-043 requires it, and the reason is concrete:
collapsed into one, whoever runs payroll can raise their own salary and then run it.

`payroll-payslips.read-own` is a real permission rather than an implicit right. Because the
prefix is exempt, an employee must be granted it — which means the set of people who can see
any payslip at all is an explicit, auditable list rather than a side effect of role
assignment.

---

## Seeding

`backend/prisma/seeds/modules/iam.seed.ts` currently grants `ADMIN` every permission except
`portal-*`. Extend that exclusion to `payroll-*`:

```
ADMIN  → every permission EXCEPT codes starting `portal-` or `payroll-`
```

Removing the bypass and then granting the permissions back would be no boundary at all — the
same reasoning ADR-0006 recorded for the portal.

Suggested initial grants, expressed as roles the school already has:

| Who | Grants |
|---|---|
| Staf TU | all `presence-*`, `work-patterns.*`, `non-working-days.*`, `leave-types.*`, `leave-requests.read`, `payroll-runs.create/read/update`, `payroll-components.*` |
| Kepala Sekolah | `presence-records.read`, `presence-periods.close`, `leave-requests.approve`, `payroll-salaries.read/update`, `payroll-runs.read/approve`, `payroll-payslips.read` |
| Guru / Wali Kelas | `presence-records.read-own`, `leave-requests.create/read-own`, `payroll-payslips.read-own`, plus the existing `attendances.*` they already hold |
| Non-teaching staff | `presence-records.read-own`, `leave-requests.create/read-own`, `payroll-payslips.read-own` |

Note the deliberate asymmetry: TU can **run** payroll but not **set** salaries; Kepala Sekolah
can set salaries and approve but does not create runs. Neither can complete a payroll cycle
alone.

---

## Verification

Two e2e specs, modelled on the portal's existing sweeps:

- `test/payroll-authorization.e2e-spec.ts` — enumerates every route in
  [payroll-api.md](./payroll-api.md) and asserts each returns `403` for an `ADMIN`-role account
  holding no explicit payroll grant. This is the regression test for ADR-0008; without it, a
  later edit to `ROLE_BYPASS_EXEMPT_PREFIXES` silently reopens every salary in the school.
  Directly analogous to `test/portal-public-visibility.e2e-spec.ts`.
- `src/presence/presence-roster-independence.spec.ts` — asserts no source file under
  `src/presence/` or `src/payroll/` references a position name, position category, or
  employment-type code. This is SC-016 and FR-056 enforced by assertion rather than by review,
  in the spirit of `src/portal/portal-siakad-disjointness.spec.ts`.
