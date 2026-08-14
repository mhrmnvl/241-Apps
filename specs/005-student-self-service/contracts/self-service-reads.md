# Contracts: self-service reads

**Date**: 2026-08-14 · **Plan**: [plan.md](plan.md)

Five endpoints are added and one existing read is narrowed. Every management
endpoint keeps its current path, permission and response shape.

Two rules apply to all of them and are not repeated per endpoint:

- **No user parameter exists.** The subject is the caller. There is no
  `studentId` query field on these routes; supplying one has no effect, and the
  contract test asserts that by sending another student's identifier.
- **Route order.** Each `.../me` route is declared **before** its `:id` sibling,
  or Nest will parse `me` as a uuid and answer 400. The presence leave
  controller carries this note at the point of declaration; copy it.

---

## `GET /rapors/me`

**Permission**: `report-cards.read-own`

**Query**: `semesterId?` — defaults to the active semester.

**Returns**: the caller's own report cards, `isPublished` only, in the shape
`GET /rapors` already returns, including the `meta.summary` added earlier this
week. The summary describes the caller's own set.

**Refuses**: a caller with no student record receives an empty list, not a
refusal — they are not doing anything wrong, there is simply nothing of theirs.

---

## `GET /rapors/me/:id`

**Permission**: `report-cards.read-own`

**Returns**: one of the caller's own published report cards, with its subject
lines, in the shape `GET /rapors/:id` returns.

**Refuses**: `404` when the id is not the caller's own, or is unpublished. The
refusal must not distinguish "not yours" from "does not exist" — otherwise it
answers whether another student has a report card (spec, User Story 1,
scenario 2).

---

## `GET /student-scores/me`

**Permission**: `student-scores.read-own`

**Query**: `semesterId?`, `subjectId?` — both narrow within the caller's own
rows; neither can widen beyond them.

**Returns**: the caller's marks per assessment item for the period, including
items that exist but have no mark yet, so the screen can show what is still
outstanding rather than an empty page (spec, User Story 2, scenario 3).

---

## `GET /academic/attendances/me`

**Permission**: `attendances.read-own`

**Query**: `semesterId?`, `month?`, `year?`

**Returns**: the caller's own daily attendance rows, plus their own totals —
present, late, absent, excused — computed over the same filtered set, not over
the page.

**Does not add**: a recap or trend variant. Those describe a cohort and remain
management-only (FR-003). A student's own percentage is their own arithmetic and
belongs in the totals above.

---

## `GET /schedules/me`

**Permission**: `schedules.read-own`

**Returns**, resolved from the caller's records server-side:

- a **student** — the timetable of the classroom they are enrolled in for the
  active semester
- a **teacher** — their own teaching schedule
- **someone who is both** — both, distinguishable in the response
- **someone who is neither** — empty

The caller does not say which they are, and the response does not depend on any
role name. This is what replaces `useSchedule`'s `roles.includes('TEACHER')`.

---

## `GET /students` (existing — narrowed)

**Permission**: unchanged, `students.read`

**Change**: the injected caller stops being ignored. The parameter is named
`_user` today, which records that the omission was deliberate at the time.

**Behaviour**: a caller who holds `students.read` continues to receive the
roster. This route is *not* offered to students at all — their own record is
reached through `GET /students/:id`, which already narrows to self
(`get-student-by-id.use-case.ts:16-30`), and after this feature the student role
no longer holds `students.read`.

**Why it is still in scope**: closing the exposure means removing the grant, and
a reader of this contract needs to know the roster read was reachable and why it
no longer is.

---

## Contract tests

For each of the five new endpoints:

1. **Scoped**: two students exist with data; A's request returns only A's rows.
2. **Not widenable**: A repeats the request with B's identifier supplied in
   every plausible field; the result is unchanged.
3. **Empty, not wide**: a caller holding the permission with no student record
   receives an empty result — asserted explicitly, because the failure mode is
   falling through to an unscoped query.
4. **Period default**: with no semester supplied, the active one is used.
5. **Management untouched**: the same fixtures through the management endpoint
   with the management permission return what they return today.

For `/rapors/me` additionally: an unpublished report card belonging to the
caller is absent (FR-005), and requesting another student's id by way of
`/rapors/me/:id` gives `404` rather than `403`.
