# Contract: Presence API

**Feature**: `002-qr-attendance-payroll` | Domain: `backend/src/presence/`

Every response uses the global envelope produced by `core/interceptors/response.interceptor.ts`:
`{ statusCode, message, data, meta? }`. There is no `success` field. List endpoints return
`PaginatedResponse<T>`; the repository returns `{ data, total, page, limit }` and the
interceptor folds it into `data` + `meta`.

All routes sit behind the global `JwtAuthGuard` + `PermissionGuard` **except** the two marked
`@DeviceAuth()`, which opt out of the JWT guard and into `DeviceGuard` (research R7).

Errors are NestJS HTTP exceptions — `NotFoundException`, `ConflictException`,
`ForbiddenException`, `BadRequestException`, `UnprocessableEntityException`. Never a bare
`Error`.

---

## Scan ingest — `presence/scan`

### `POST /presence/scans` · `@DeviceAuth()`

The hot path. One scan.

```jsonc
// request
{
  "code": "9pQ3…",             // opaque token read from the card (R12)
  "clientEventId": "uuid",     // retry key (R4)
  "occurredAt": "2026-08-10T07:02:11.000Z",  // server-anchored derivation (R3)
  "clockAnchorId": "uuid"      // which anchor produced occurredAt; null when online
}

// 201 — data
{
  "outcome": "ACCEPTED",       // ScanOutcome
  "direction": "CHECK_IN",     // CHECK_IN | CHECK_OUT | NONE
  "person": {
    "displayName": "Ahmad Fauzi",
    "subjectType": "EMPLOYEE",
    "photoUrl": "/files/…"     // may be null
  },
  "dayStatus": "LATE",
  "lateMinutes": 2,
  "recordedAt": "2026-08-10T07:02:11.000Z"
}
```

Rejections return **201 with an outcome**, not an HTTP error — the kiosk must render "kartu
tidak berlaku" identically to a success, and an error status would be indistinguishable from
a network failure the queue should retry. Only malformed payloads are `400`.

`person` is omitted entirely when the code did not resolve, so an unknown card leaks nothing.

**Behaviour**: resolve code → active credential; reject if unknown, revoked, or the person is
inactive. Reject as `REJECTED_STALE` if `occurredAt` is in the future or older than the
configured offline window. Suppress as `DUPLICATE` if an accepted scan for the credential
exists within the suppression window (default 60 s). Otherwise write the scan, then create or
update the day's `DailyPresence` — first accepted scan sets `checkInAt` and derives status
against the resolved working pattern; a later one sets `checkOutAt`. Touch `device.lastSeenAt`.

### `POST /presence/scans/batch` · `@DeviceAuth()`

Offline flush. Body: `{ "scans": [ …same shape…, max 500 ] }`.

Returns per-item results keyed by `clientEventId`, so a partially applied batch resolves
correctly on retry (R4, R11):

```jsonc
{ "results": [ { "clientEventId": "uuid", "outcome": "ACCEPTED", "accepted": true } ] }
```

Already-seen `clientEventId`s return their original outcome with `accepted: true` — the
device may then clear them. Processed in `occurredAt` order so check-in precedes check-out.

### `GET /presence/scans/clock` · `@DeviceAuth()`

`{ "serverTime": "…", "anchorId": "uuid", "maxOfflineWindowHours": 8 }` — the anchor the
device pins its monotonic counter to (R3).

### `GET /presence/scans` · `presence-scans.read`

Query: `page`, `limit`, `deviceId`, `outcome`, `dateFrom`, `dateTo`, `credentialId`.
Returns the evidence log including rejections (FR-003).

---

## Credentials — `presence/credential`

| Method | Path | Permission |
|---|---|---|
| `POST` | `/presence/credentials` | `presence-credentials.create` |
| `GET` | `/presence/credentials` | `presence-credentials.read` |
| `GET` | `/presence/credentials/:id` | `presence-credentials.read` |
| `POST` | `/presence/credentials/:id/revoke` | `presence-credentials.update` |
| `POST` | `/presence/credentials/:id/replace` | `presence-credentials.create` |
| `GET` | `/presence/credentials/print` | `presence-credentials.read` |

`POST` body: `{ "userId": "uuid", "subjectType": "STUDENT" }`. The generated `code` is
returned **only** in this response and in the print payload; list and detail responses never
include it. Issuing while an active credential exists → `409 ConflictException`.

`revoke` body: `{ "reason": "Kartu hilang" }`. `replace` revokes and issues in one same-module
transaction, returning the new credential.

`GET /presence/credentials/print?userIds=…` returns the batch a card sheet needs:
`[{ credentialId, code, displayName, identifier, subjectType, photoUrl }]`. The QR image is
rendered client-side by `qrcode`; the server never produces an image.

---

## Devices — `presence/device`

| Method | Path | Permission |
|---|---|---|
| `POST` | `/presence/devices` | `presence-devices.create` |
| `GET` | `/presence/devices` | `presence-devices.read` |
| `PATCH` | `/presence/devices/:id` | `presence-devices.update` |
| `POST` | `/presence/devices/:id/rotate-token` | `presence-devices.update` |
| `DELETE` | `/presence/devices/:id` | `presence-devices.delete` |

`POST` and `rotate-token` return `{ "token": "…" }` **once**; only the hash is stored, and no
later request can retrieve it. The list response exposes `lastSeenAt` so a silent gate is
visible without inferring it from missing attendance.

---

## Daily records — `presence/daily-record`

### `GET /presence/daily-records` · `presence-records.read`

Query: `date` (required), `subjectType`, `userId`, `status`, `page`, `limit`.

```jsonc
{
  "id": "uuid",
  "user": { "id": "uuid", "displayName": "Ahmad Fauzi" },
  "subjectType": "EMPLOYEE",
  "date": "2026-08-10",
  "checkInAt": "2026-08-10T07:02:11.000Z",
  "checkOutAt": null,
  "checkInSource": "SCAN",
  "checkOutSource": null,
  "status": "LATE",
  "statusSource": "SCAN",
  "lateMinutes": 2,
  "earlyLeaveMinutes": 0,
  "expected": { "startTime": "07:00", "endTime": "14:00", "patternName": "Standar" },
  "leaveRequestId": null,
  "corrected": false,
  "note": null
}
```

`corrected` is `true` when any `PresenceCorrection` exists, satisfying FR-014 and Acceptance
Scenario 2.3 without a second request.

### `GET /presence/daily-records/me` · `presence-records.read-own`

Query: `year`, `month` (both optional — default the current month).

Returns the authenticated user's own daily records plus their monthly totals, in the same
row shape as the list above. **There is no `userId` parameter**, so the route cannot be
pointed at anyone else. A person holding only `read-own` who calls the plain list endpoint
gets `403`.

This is the route every employee actually uses. It is also how someone notices a missing
scan the same day rather than at month end, which is the cheapest possible moment to correct
one.

### `POST /presence/daily-records` · `presence-records.create`

Manual entry for someone who never scanned. Body requires `userId`, `date`, `status`,
`reason`; `checkInAt` / `checkOutAt` optional. Sources are set to `MANUAL`.

### `PATCH /presence/daily-records/:id` · `presence-records.update`

Body: any of `checkInAt`, `checkOutAt`, `status`, `note`, plus **required** `reason`.
Omitting `reason` → `400`. Writes one `PresenceCorrection` per changed field and one
`AuditLog` row. Editing a record inside a `CLOSED` period → `409`.

An actor editing their own record → `403` (FR-015), checked against the authenticated user
regardless of permissions held.

### `GET /presence/daily-records/recap` · `presence-records.read`

Query: `year`, `month` (both required), `subjectType`, `userId`.

```jsonc
{
  "period": { "year": 2026, "month": 8, "status": "OPEN", "workingDays": 21 },
  "rows": [{
    "user": { "id": "uuid", "displayName": "Ahmad Fauzi" },
    "presentDays": 19, "absentDays": 1, "lateCount": 3, "lateMinutes": 47,
    "earlyLeaveCount": 0, "officialDutyDays": 0,
    "leaveDays": { "SAKIT": 1, "CUTI_TAHUNAN": 0 },
    "attendanceRate": 95.2
  }]
}
```

`GET /presence/daily-records/recap/export` returns the same figures as a spreadsheet
(FR-038) — same use case, different presenter, so the two cannot diverge.

---

## Work patterns, non-working days, periods — `presence/work-pattern`

| Method | Path | Permission |
|---|---|---|
| `GET POST` | `/presence/work-patterns` | `work-patterns.read` / `.create` |
| `GET PATCH DELETE` | `/presence/work-patterns/:id` | `work-patterns.*` |
| `PUT` | `/presence/work-patterns/:id/days` | `work-patterns.update` |
| `GET POST DELETE` | `/presence/work-pattern-assignments` | `work-patterns.*` |
| `GET POST PATCH DELETE` | `/presence/non-working-days` | `non-working-days.*` |
| `POST` | `/presence/non-working-days/bulk` | `non-working-days.create` |
| `GET` | `/presence/periods` | `presence-records.read` |
| `POST` | `/presence/periods/:year/:month/close` | `presence-periods.close` |

`PUT …/days` replaces all seven weekdays atomically — a partial update could leave a pattern
with no Friday, which would silently make Friday a non-working day for everyone assigned.

`POST /presence/non-working-days/bulk` body: `{ "days": [{ "date", "name", "sourceCalendarId?" }] }`.
Upserts by date, returning `{ "imported": n, "skipped": n }`. It reads **nothing** from
`academic/` — the operator's browser fetches the academic calendar, previews the dates, and
posts them here. That keeps the domain graph one-way; see
[internal-ports.md](./internal-ports.md).

Closing a period that contains records lacking a check-out returns `409` listing them —
closing is what fixes payroll's inputs, so it must not silently accept an incomplete month.

---

## Leave — `presence/leave`

| Method | Path | Permission |
|---|---|---|
| `GET POST PATCH DELETE` | `/presence/leave-types` | `leave-types.*` |
| `POST` | `/presence/leave-requests` | `leave-requests.create` |
| `GET` | `/presence/leave-requests` | `leave-requests.read` |
| `GET` | `/presence/leave-requests/me` | `leave-requests.read-own` |
| `POST` | `/presence/leave-requests/:id/approve` | `leave-requests.approve` |
| `POST` | `/presence/leave-requests/:id/reject` | `leave-requests.approve` |
| `POST` | `/presence/leave-requests/:id/withdraw` | `leave-requests.create` (own only) |
| `GET` | `/presence/leave-balances` | `leave-requests.read` |
| `GET` | `/presence/leave-balances/me` | `leave-requests.read-own` |

`POST /presence/leave-requests` body: `{ leaveTypeId, startDate, endDate, reason, documentFileId? }`.
Computes `workingDayCount` and the `LeaveDay` rows at submission against the pattern and
holidays then in force. `requiresDocument` without `documentFileId` → `422`.

`approve` — refuses when `approverId === requesterId` (`403`, FR-029), when the type consumes
quota and the balance is short (`422` stating the shortfall, FR-032), or when the request is
not `PENDING` (`409`). On success, writes the covered days into `DailyPresence` with
`status` from `LeaveType.treatment` and `leaveRequestId` set, in one same-module transaction.

`reject` requires `reason`. `withdraw` is allowed only by the requester and only while
`PENDING`.

Scans landing on an approved leave day are still recorded and surfaced by the daily list as a
conflict rather than discarded (FR-034).

---

## Student-side integration

No new public endpoint. `academic/attendance` reaches presence through an injected in-process
port — see [internal-ports.md](./internal-ports.md). The existing attendance endpoints keep
their current shapes; only the class-view response gains a `gateSuggestion` block, which is
additive.
