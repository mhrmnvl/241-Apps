# Narrowing the `ADMIN` permission bypass at the portal boundary

**Context**: `PermissionGuard` returns `true` for any user holding role code `ADMIN` or `SUPER_ADMIN`, before permissions are consulted. The project constitution names this bypass as its single sanctioned exception to permission-based authorization, so changing it is a decision rather than a fix.

FR-062 requires that holding an administrative role in SIAKAD MUST NOT by itself confer the ability to publish to the school's public website. The requester's stated reason for a separate portal (ADR-0005) is that its operators may be different people from SIAKAD's. With the bypass untouched, every SIAKAD administrator satisfies every `portal-*` permission automatically, and FR-060 through FR-062 are undeliverable — the boundary would exist only in documentation.

**Decision**: the `ADMIN` half of the bypass no longer covers permissions whose module segment begins `portal-`. An `ADMIN` asking for a `portal-*` code falls through to the ordinary permission check and is granted only if their roles actually hold it. **`SUPER_ADMIN` keeps the full bypass**, including over `portal-*`.

The exemption is a prefix list read by the guard — data, not new branching — and stays inside the guard, where role-to-permission resolution already lives.

## Considered Options

- **Leave the bypass alone and weaken FR-062** — rejected. The requester's motivation for the whole feature is that portal and SIAKAD have different operators. A boundary that the role the school actually delegates walks straight through is not a boundary, and would have to be explained away every time someone asked why the humas team's permissions matter.
- **Remove `ADMIN` from the bypass entirely** — rejected. Every existing `ADMIN` would instantly lose access to everything not explicitly granted, across academic, personnel, inventory, and admission. That is a repo-wide permission migration with a large blast radius, far outside this feature, and it would be discovered in production rather than in review.
- **Remove `SUPER_ADMIN` from the bypass for `portal-*` as well** — rejected, and this is the one the requester was asked to decide explicitly. Symmetry is appealing, but it leaves no account type able to recover the portal if every portal operator loses access — a locked-out portal with no break-glass path is a worse failure than an over-privileged `SUPER_ADMIN`. **Confirmed by the requester (2026-08-06)**: `SUPER_ADMIN` retains the bypass; `ADMIN` does not.
- **A `portalBypassAllowed` flag on the role record** — rejected as configuration that looks like policy. It moves a security decision into seed data, where a future reseed can silently reverse it, and nothing in the codebase would explain why the flag exists.
- **Deny by endpoint rather than by prefix** — rejected. It requires every new portal controller to remember to opt in, which is exactly the kind of rule that holds until the day someone forgets.

## Consequences

- **Blast radius is zero at the time of the change.** No endpoint outside `backend/src/portal/` uses a `portal-*` code, so no existing access changes. Every non-portal permission an `ADMIN` could reach before, they still reach, without a permission lookup.
- **The prefix list is now load-bearing.** A future permission module named `portal-…` inherits the exemption automatically, which is the intent; a portal module named anything else silently does not. Module segments for portal permissions must keep the `portal-` prefix.
- **An `ADMIN` can still run the portal** — by being granted the codes explicitly, or by holding `PORTAL_EDITOR` alongside `ADMIN`. The exemption removes the free pass, not the possibility.
- **The frontend must mirror this exactly.** `portal-web`'s router grants `SUPER_ADMIN` a client-side pass and deliberately does not grant one to `ADMIN`. A UI that offered actions the API then refused would be worse than no UI: the failure would surface as a confusing 403 after the editor had already written the article.
- **This is the second entry in the plan's Complexity Tracking** and the second deliberate deviation from the constitution in this feature. It is recorded there as well as here.
- **Tested rather than assumed.** `permission.guard.spec.ts` covers the four cases from `contracts/permissions.md`: `ADMIN` refused a portal code, `ADMIN` unchanged on every non-portal code, `SUPER_ADMIN` passing both, and a portal editor passing portal codes while refused academic ones — plus a mixed-requirement route, which is where a naive implementation leaks.
