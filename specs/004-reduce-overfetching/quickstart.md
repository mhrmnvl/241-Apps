# Quickstart: Validating "Fetch Only What Is Shown"

**Feature**: `004-reduce-overfetching` | **Date**: 2026-08-12

How to prove this feature works. Run the baseline **before** any code changes — the
success criteria are relative, so without it there is nothing to compare against.

## Prerequisites

```bash
pnpm install
pnpm --filter backend dev          # http://localhost:3000
pnpm dev:academic                  # http://localhost:5173
```

Sign in as an account holding `students.read`, `teachers.read`, `schedules.read` and
`curricula.read`.

---

## Step 1 — Capture the baseline (before any edit)

For each screen below: open DevTools → Network, filter to XHR, hard-reload, and
record **request count** and **total transferred**.

| # | Screen | Path |
|---|---|---|
| B1 | Student list | `/data/student` |
| B2 | Teacher list | `/data/teacher` |
| B3 | Schedule | `/schedule` |
| B4 | Classroom manage | `/academic/classroom/:id/manage` |
| B5 | Curriculum subject | `/academic/curriculum/:id/subject` |
| B6 | Cold-start sign-in | `/login` → dashboard, cleared site data |

Also record, for B1 and B2, the size of a single row in the response body — that is
what the projection work shrinks.

Write the numbers into `specs/004-reduce-overfetching/baseline.md`. Nothing else in
this feature can be judged without them.

---

## Step 2 — Verify the projections (FR-001 to FR-005)

**No whole-person reads remain:**

```bash
grep -rn "profile: true" backend/src --include=*.ts
# Expected: no output
```

**Every profile read uses a shared shape:**

```bash
grep -rn "PROFILE_NAME_SELECT\|PROFILE_DISPLAY_SELECT\|PROFILE_ROSTER_SELECT" \
  backend/src --include=*.ts | wc -l
# Expected: at least 19 — one per site the audit found
```

**Nothing regressed:**

```bash
pnpm --filter backend test
pnpm --filter backend typecheck && pnpm --filter backend lint:strict
```

**The four columns that read more than a name still work.** Open B1 and B2 and
confirm by eye:

| Screen | Must still show |
|---|---|
| Student list | Gender column populated |
| Teacher list | NIK and gender columns populated |
| Classroom manage → Tambah Siswa | Gender beside each candidate |
| Any app's header | The signed-in user's avatar, not initials |

If any of these is blank, the wrong shape was applied — that is the failure mode this
feature is most likely to produce.

---

## Step 3 — Verify dialog loading (FR-006)

On B5, with the Network tab open:

1. Load the page. **Expect**: no request for the full subject list.
2. Open "Tambah Mata Pelajaran". **Expect**: the subject list is requested now, and
   the dialog shows a loading state until it arrives.
3. Close and reopen the dialog. **Expect**: no second request.

---

## Step 4 — Verify reference reuse (FR-009 to FR-011)

With the Network tab open and **without reloading**, navigate:

`Kelas` → `Kurikulum` → `Penugasan Mengajar` → `Kehadiran`

**Expect**: academic years, semesters, classrooms and teachers are each requested
once across the whole sequence, not once per page.

Then, in another tab, rename a classroom and save. Return to the first tab and open
a screen listing classrooms. **Expect**: the new name appears without a manual
reload.

---

## Step 5 — Verify resilience (FR-007, FR-012, SC-005)

**A new column reaches nobody:**

```bash
# In backend/prisma/profile.prisma add a scratch column, then:
pnpm --filter backend prisma:generate && pnpm --filter backend typecheck
```

**Expect**: compiles, and the column appears in no response. Remove it afterwards —
do not migrate it.

**List reads less than detail:** compare the response body of one row in the student
list against the same student's detail. The list row must be strictly smaller.

---

## Step 6 — Re-measure and compare

Repeat Step 1 and put the numbers beside the baseline.

| Criterion | Passes when |
|---|---|
| SC-002 | The four-page walk requests each shared list once, not four times |
| SC-003 | B5 makes at least one fewer request, and no thousand-row list |
| SC-004 | A B1 row is smaller than the same student's detail |
| SC-006 | Every screen in Step 2's table still shows what it showed at baseline |
| SC-007 | `pnpm test`, `pnpm --filter backend test`, `typecheck`, `lint:strict` and `build` all pass |

---

## Rolling back

Every change is a projection or a call site; none touches stored data and there is no
migration. Reverting the commits restores the previous reads exactly. If one screen
misbehaves, revert that screen's include rather than the feature — the shapes are
additive to each other and independent per call site.
