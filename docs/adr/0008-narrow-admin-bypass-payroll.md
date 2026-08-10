# Narrowing the `ADMIN` permission bypass at the payroll boundary

**Context**: the QR attendance feature includes full payroll — gaji pokok, tunjangan, potongan, and a net payslip per employee (spec FR-040). That makes `backend/src/payroll/` the first module in this codebase to hold every employee's salary.

`PermissionGuard` returns `true` for any user holding role code `ADMIN` or `SUPER_ADMIN` **before permissions are consulted**. The constitution names this bypass as its single sanctioned exception to permission-based authorization, and ADR-0006 already narrowed the `ADMIN` half at `portal-`.

The consequence of leaving it alone is not subtle: every `ADMIN` account reads every salary in the school by virtue of holding the role. FR-051 and SC-012 would be undeliverable, and — this is the part that matters — **no permission grant could fix it**, because the bypass runs before grants are read. "Just don't grant the permission" is not a mitigation here; it is a misunderstanding of the mechanism.

**Decision**: `payroll-` joins `portal-` in `ROLE_BYPASS_EXEMPT_PREFIXES`. An `ADMIN` asking for a `payroll-*` code falls through to the ordinary permission check and is granted only if their roles actually hold it. **`SUPER_ADMIN` keeps the full bypass**, on the same break-glass reasoning ADR-0006 recorded.

`iam.seed.ts` grants `ADMIN` every permission **except** codes prefixed `portal-` or `payroll-`. Removing a bypass and then handing the permissions back as an explicit grant would be no boundary at all.

Separately but for the same reason, the twelve payroll codes split authority two ways:

- `payroll-salaries.update` — deciding what a person is paid
- `payroll-runs.create` — calculating the month

These are different people in a school. The bendahara calculates; the kepala madrasah decides pay. Collapsed into one permission, whoever runs payroll can raise their own salary and then run it.

## Considered Options

- **Leave the bypass alone** — rejected. It makes FR-051 undeliverable and cannot be mitigated by grant configuration, for the reason above.
- **Grant `ADMIN` nothing and rely on that** — rejected as the same misunderstanding stated as a plan. The bypass ignores grants.
- **A dedicated `BENDAHARA` role checked by name** — rejected outright by Principle III, which forbids role-name comparisons outside the guard. It is also the pattern ADR-0006 already declined.
- **Remove `ADMIN` from the bypass entirely** — rejected for the same reason ADR-0006 gave: every existing `ADMIN` would instantly lose access to everything not explicitly granted across four domains, discovered in production rather than review.
- **Column-level encryption on salary amounts** — rejected as answering a different question. It defends against a database compromise; FR-051 is about application-level authority, and encryption would leave the `ADMIN` bypass reading plaintext through the ORM anyway.
- **A separate database or service for payroll** — rejected as disproportionate for a single-school deployment, and it would trade one boundary problem for a distributed-transaction problem.

## Consequences

- **Blast radius is zero at the time of the change.** No endpoint outside `backend/src/payroll/` uses a `payroll-*` code, so no existing access changes.
- **The prefix list now carries two entries and is genuinely load-bearing.** A payroll module named anything other than `payroll-…` silently inherits the blanket bypass. Module segments for payroll permissions must keep the prefix, and `permission-codes.constants.ts` is where that is visible.
- **This amends Principle III of the constitution**, which names the exemption list explicitly and states that adding a prefix is an amendment rather than a configuration change. The constitution moves 1.1.0 → 1.2.0 in the same PR.
- **Neither TU nor Kepala Sekolah can complete a payroll cycle alone.** TU runs and reviews; Kepala Sekolah sets salaries and approves. That is deliberate, and it means payroll cannot be run by one person in a hurry — which is the point.
- **Tested rather than assumed.** `permission.guard.spec.ts` covers `ADMIN` refused a payroll code, `ADMIN` still allowed a `presence-*` code, and `SUPER_ADMIN` passing both. `test/payroll-authorization.e2e-spec.ts` sweeps every payroll route with an `ADMIN` account holding no payroll grant. Without that sweep, a later edit to the prefix list reopens every salary in the school with nothing failing.
- **An employee seeing their own payslip needs `payroll-payslips.read-own` granted explicitly.** Because the prefix is exempt, this is not implicit for anyone. The set of people who can see any payslip is therefore an auditable list rather than a side effect of role assignment.
