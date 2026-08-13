# Contract: Read Projections and Cache Behaviour

**Feature**: `004-reduce-overfetching` | **Date**: 2026-08-12

This feature exposes no new HTTP endpoint. Its contracts are two internal ones that
other code must hold to, plus a compatibility promise about existing responses.

---

## C1. HTTP responses — compatibility promise

**No response body changes shape**, with one class of exception.

A field may be removed from a response only when all three hold:

1. No frontend file reads it — verified by grepping every app and package.
2. No backend mapper, DTO or use case reads it.
3. It is not part of a document rendered for a person (the rapor PDF, the student
   spreadsheet) — those are exempt from this feature entirely.

Where any of the three cannot be established, the field stays. A field kept
unnecessarily costs a few bytes; a field removed wrongly blanks a column somebody
relies on.

**Endpoints whose response is explicitly unchanged despite their reads changing:**

| Endpoint | What changes behind it |
|---|---|
| `GET /profiles/me` | One six-level read becomes three; the merged body is identical |
| `GET /auth/me` | Stops reading columns it never returned |
| `GET /students`, `GET /teachers` | Keep `gender` and `nik`; stop reading the rest |
| Every list that shows a name | Reads a name instead of a whole person |

---

## C2. Person projections — the shapes every include must use

Any Prisma read that reaches a `Profile` MUST reference one of three exported
constants. Writing an inline profile select, or `profile: true`, is a defect.

```ts
// backend/src/shared/domain/prisma-selects.ts
export const PROFILE_NAME_SELECT = { … } satisfies Prisma.ProfileDefaultArgs;
export const PROFILE_DISPLAY_SELECT = { … } satisfies Prisma.ProfileDefaultArgs;
export const PROFILE_ROSTER_SELECT = { … } satisfies Prisma.ProfileDefaultArgs;
```

**Which to use**

| Situation | Shape |
|---|---|
| A person appears as a label | `PROFILE_NAME_SELECT` |
| A person's picture is drawn | `PROFILE_DISPLAY_SELECT` |
| Student, teacher or enrolment list | `PROFILE_ROSTER_SELECT` |
| The profile detail screen | Its own explicit select — not one of these |

**Obligations**

- Each shape carries `satisfies Prisma.ProfileDefaultArgs`, so a field that does not
  exist fails to compile rather than at runtime.
- A screen needing a field outside these shapes states it at the call site and says
  why in a comment. It does not widen a shared shape for one screen.
- Adding a field to any shape requires checking every consumer of that shape, because
  it reaches all of them.

**Verification**: no occurrence of `profile: true` remains under `backend/src`.

---

## C3. Reference cache — the behaviour callers may rely on

A caller asks for a reference list and receives it, without knowing whether it was
held or fetched.

| Guarantee | Meaning |
|---|---|
| **Read-through** | Asking for a list always yields the list or an error, never an empty array standing in for "not loaded yet" |
| **Single flight** | Two screens asking at the same moment cause one request, not two |
| **Bounded staleness** | A list is never older than its stated expiry (see data-model.md) |
| **Write invalidates** | Creating, updating or deleting a reference record expires its list, so the next read is fresh |
| **Cleared on sign-out** | No list survives a session |

**What it does not promise**

- Not cross-tab. Two tabs hold two caches; each honours its own expiry.
- Not persistent. A reload refetches. Reference data is small; correctness beats a
  few saved requests.
- Not a general query cache. It holds reference lists, not paginated tables, not
  detail records.

---

## C4. Dialog data — when it is allowed to load

A list used only inside a dialog MUST NOT be requested by the page that contains the
dialog.

| Moment | Expected |
|---|---|
| Page loads | The dialog's data is not requested |
| Dialog opens the first time | Requested; the dialog shows it is loading |
| Dialog reopens within its expiry | Served from the cache, no request |
| Request fails | The dialog says so and offers a retry; the page behind it is unaffected |
