# Data Model: Fetch Only What Is Shown

**Feature**: `004-reduce-overfetching` | **Date**: 2026-08-12

No database schema changes. No migration. This feature changes **which columns are
read**, not what is stored.

What follows are the projections the system reads, and the client-side entities that
hold reference data between screens.

---

## Read projections (backend)

Declared once in `backend/src/shared/domain/prisma-selects.ts` and referenced by
every include that touches a person.

### `PROFILE_NAME_SELECT`

| Field | Why |
|---|---|
| `name` | The only thing the screen draws |

Used where a person appears as a label: schedule, attendance, assessment item and
score, report card, graduation, classroom supervisor, classroom structure (×4 roles),
admission application, portal author, presence credential and leave.

### `PROFILE_DISPLAY_SELECT`

| Field | Why |
|---|---|
| `name` | Shown beside the picture |
| `avatarFile.storageKey` | The signed URL is derived from it by `withAvatarUrl` |

Used where a face is drawn: the session identity behind every app's `AppLayout`, and
the profile screen's header.

> Selecting `avatarFileId` instead would compile and return null for every avatar.
> The URL comes from the file's storage key, not from the foreign key.

### `PROFILE_ROSTER_SELECT`

| Field | Why |
|---|---|
| `name` | Displayed |
| `gender` | A column on the student, teacher and enrolment lists |
| `nik` | A column on the teacher list |

Used by exactly three lists. Not a default.

### What none of them carry

`birthDate`, `birthPlace`, `email`, `phone`, `npwp`, `kk`, `maritalStatus`,
`religionId`, `bloodTypeId`, `address`, and the `socialMedias`, `achievements`,
`scholarships` and `educationalHistories` relations. These belong to the profile
detail screen, which asks for them explicitly.

---

## Query split (backend)

`USER_DETAIL_SELECT` currently answers the profile detail screen in one read six
levels deep. It becomes three reads whose combined **response is unchanged**:

| Read | Returns | When |
|---|---|---|
| Identity | user, profile with its own relations, roles | Always |
| Teacher detail | employment type, positions, teaching assignments, addresses | Only when the user has a teacher record |
| Student detail | enrolments, classroom, grade, parents | Only when the user has a student record |

The deepest branch — classroom → supervisors → teacher → user → profile — collapses
to `PROFILE_NAME_SELECT`, since the screen shows the wali kelas's name and nothing
else about them.

---

## Reference cache (frontend)

One store in `@241/platform`, holding lists that a user picks from.

### `CachedList`

| Attribute | Meaning |
|---|---|
| `key` | Which list — academic years, semesters, classrooms, subjects, teachers, positions, employment types, religions, blood types, occupations |
| `items` | What was retrieved |
| `fetchedAt` | When, so expiry can be judged |
| `status` | idle, loading, ready, or failed |

**Rules**

- A read of a `ready` list newer than its expiry returns what is held; nothing is requested.
- A read of an expired, `idle` or `failed` list requests it and marks it `loading`.
- Concurrent reads while `loading` wait for the one request, never issue a second.
- Writing a reference record marks its list expired, so the next read refreshes it.
- The store is cleared on sign-out.

### Expiry per list

Derived from how often each actually changes, not from a uniform default:

| List | Expiry | Why |
|---|---|---|
| Religions, blood types, occupations, education levels | Session | Effectively fixed |
| Positions, employment types, position categories | 60 minutes | Edited a few times a year |
| Academic years, semesters | 30 minutes | Edited at term boundaries |
| Subjects, grades | 10 minutes | Edited during curriculum planning |
| Classrooms, teachers | 5 minutes | Edited during the term |

---

## Not in this model

- No new tables, columns, indexes or enums.
- No change to any request or response body, except the removal of fields confirmed
  unread (FR-013 and the compatibility assumption in the spec).
- No change to permissions: this feature narrows what is read, never who may read it.
