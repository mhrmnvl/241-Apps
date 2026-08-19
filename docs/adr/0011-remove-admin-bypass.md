# ADR-0011: Remove the ADMIN bypass entirely

**Status**: Accepted · **Date**: 2026-08-15

**Supersedes**: [ADR-0006](0006-narrow-admin-permission-bypass.md),
[ADR-0008](0008-narrow-admin-bypass-payroll.md)

## Context

`PermissionGuard` passed two role names without reading any grant. SUPER_ADMIN
passed everything, as the break-glass path. ADMIN passed everything except codes
prefixed `portal-` and `payroll-`, which were carved out one at a time:

- ADR-0006 (`portal-`): holding an administrative role in SIAKAD must not by
  itself confer the right to publish to the school's public website.
- ADR-0008 (`payroll-`): the same argument with money.

Both ADRs made the same observation — a boundary the top delegated role walks
straight through is not a boundary — and both answered it by adding a prefix to
an exemption list.

The school then asked for administrators per application: an academic
administrator, a portal administrator, an admission administrator, an inventory
administrator. Not one administrator for everything.

That request cannot be satisfied while ADMIN bypasses. Granting an academic
administrator the ADMIN role would hand them admission, inventory and presence
as well, and no configuration could take it back, because the bypass runs
before grants are read.

## Decision

Remove the ADMIN bypass. `PermissionGuard` now recognises one role name,
SUPER_ADMIN, and every other role — ADMIN included — is authorised by the
permissions it holds.

`ROLE_BYPASS_EXEMPT_PREFIXES` is deleted rather than extended.

## Why not extend the list

Adding `presence-` and `inventory` would have answered today's request and
recreated the problem. The exemption list has a defect of shape: it enumerates
what ADMIN may *not* do, so every new area needing separation has to be
remembered into it, and forgetting is silent — the permission simply works for
every ADMIN, and no grant configuration reveals it. The list would have grown
until it named everything, at which point the bypass would be gone anyway,
having been wrong for however long the additions lagged behind.

Removing it inverts the default: a role holds what it is given.

## Consequences

**ADMIN becomes an ordinary role.** It carries whatever grants it is given, and
"Admin Akademik" or "Admin Portal" are roles like any other. What separates
them is their permissions rather than a name the guard recognises.

**SUPER_ADMIN remains the sole break-glass path**, and the single sanctioned
place where a role name decides an outcome. That exception stays because
recovery has to be possible when a grant configuration locks everyone out.

**Nothing broke on the way in.** No user held ADMIN in either database when this
shipped — zero in dev, and the role did not exist in production. The change was
free at that moment and would have grown more expensive every week the school
used the system.

**A configuration step now exists that did not.** An administrator who is meant
to administer must be granted permissions. Previously the role name was enough,
and a school that assigns ADMIN and grants nothing will find it does nothing —
which is correct, and needs saying out loud in the operating notes rather than
discovered.

**The two superseded ADRs are not deleted.** Their reasoning is why this one
exists, and the boundaries they drew are now structural rather than enumerated.
