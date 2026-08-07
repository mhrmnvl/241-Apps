# Contract: Portal Permission Catalogue

**Feature**: `001-content-management-system` | **Date**: 2026-08-06

New entries for `SYSTEM_PERMISSIONS` in
`backend/src/platform/access-control/permission/constants/permission-codes.constants.ts`.
That file's header states it is kept 1:1 with every `@RequirePermissions(...)` in the
codebase and synced via `POST /permissions/sync` or a reseed — so these land together with
the controllers that use them, never after.

Module segments are plural, per constitution III.

---

## New permission codes

| Module | Actions | Governs |
|---|---|---|
| `portal-posts` | `create`, `read`, `update`, `delete`, `publish` | Berita, Artikel, Pengumuman; media library reads |
| `portal-agendas` | `create`, `read`, `update`, `delete`, `publish` | Agenda entries |
| `portal-albums` | `create`, `read`, `update`, `delete`, `publish` | Gallery albums and photos |
| `portal-pages` | `create`, `read`, `update`, `delete`, `publish` | Static pages and public navigation |
| `portal-categories` | `create`, `read`, `update`, `delete` | Post categories |
| `portal-tags` | `create`, `read`, `update`, `delete` | Post tags |
| `portal-settings` | `read`, `update` | Homepage section configuration |

**30 codes total.**

`publish` is a fifth action alongside CRUD and is required by FR-059. It governs every
transition that changes what the public sees — publish, unpublish, archive, and pin — so a
staff member can be trusted to write without being trusted to put something on the school's
public website. It is the substitute for a review-and-approve workflow, which the spec's
Assumptions deliberately leave out for a team of fewer than ten.

---

## Suggested role

A `PORTAL_EDITOR` role seeded with all 30 codes plus `files.create` and `files.read`
(uploads go through the existing `POST /files/upload?appKey=PORTAL`).

This role grants **nothing** academic, personnel, inventory, or admission. A holder can run
the entire portal and cannot read a single student record — FR-060 and FR-061, verified by
SC-005.

A narrower `PORTAL_AUTHOR` (everything except the five `publish` actions) is the natural
second role once more than one person writes, but is not required for v1.

---

## The `ADMIN` bypass — required change

`permission.guard.ts:38-45` currently returns `true` for any user holding role code
`ADMIN` or `SUPER_ADMIN`, **before** permissions are consulted:

```ts
// Admin and Super Admin bypass all permission checks
const userRoles = await this.permissionRepository.findUserRoles(user.id);
const isAdmin = userRoles.some(
  (ur) => ur.role.code === 'SUPER_ADMIN' || ur.role.code === 'ADMIN',
);
if (isAdmin) {
  return true;
}
```

Left as-is, every SIAKAD administrator can publish to the school's public website, and
FR-062 ("holding an administrative role in SIAKAD MUST NOT by itself confer the ability to
publish to the portal") is undeliverable. The constitution names this bypass as its single
sanctioned exception, so changing it is a decision, not a fix.

**Change**: the `ADMIN` half of the bypass no longer covers permissions whose module begins
`portal-`. `SUPER_ADMIN` keeps the full bypass as break-glass.

```ts
const PORTAL_PERMISSION_PREFIX = 'portal-';
// ADMIN's blanket bypass stops at the portal boundary — FR-062, ADR-0006.
// SUPER_ADMIN keeps it so the portal stays recoverable.
```

The exemption is data rather than new branching, it stays inside the guard where
role-to-permission resolution belongs, and its blast radius is zero: no existing endpoint
uses a `portal-*` code, so no current access changes. Recorded as **ADR-0006** and in the
plan's Complexity Tracking.

**Required tests**: guard specs proving (a) `ADMIN` without `portal-posts.publish` is
refused, (b) `ADMIN` still passes every non-portal permission unchanged, (c) `SUPER_ADMIN`
passes both, (d) a `PORTAL_EDITOR` passes portal codes and is refused academic ones.

**Confirmed by the requester (2026-08-06)**: `SUPER_ADMIN` keeps the bypass, `ADMIN` does
not. The exemption is scoped to the `ADMIN` role only. This leaves exactly one account type
able to recover the portal if every portal operator is locked out, and it is the reason
FR-062 is satisfied for the role the school actually delegates (`ADMIN`) while a documented
break-glass path remains.

---

## Frontend permission gating

`portal-web`'s router uses `meta.requiredPermission` on management routes, matching the
guard pattern already in `apps/admission/src/app/providers/router/index.ts`. Menu entries
are filtered by held permissions so a visitor without them sees no management surface at
all (FR-063).

Two notes carried from the existing router, because both are load-bearing here:

- The client-side check is an optimistic gate only. Real enforcement is the server guard —
  the access token lives in memory and is gone after a reload, so the persisted user profile
  is what the router reads. SC-005 must be verified against the API, not the UI.
- The academic router grants `SUPER_ADMIN` a blanket client-side pass. The portal router
  must mirror whatever the guard ends up doing, or the UI will offer actions the API then
  refuses.
