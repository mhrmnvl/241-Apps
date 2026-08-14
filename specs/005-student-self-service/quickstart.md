# Quickstart: proving the student surface is separate

**Date**: 2026-08-14 · **Plan**: [plan.md](plan.md)

How to convince yourself this works, in the order the slices ship. Each section
stands alone: after P1 you can run its checks and stop.

## Prerequisites

```bash
pnpm install
pnpm --filter backend prisma:generate
```

A database with at least: two students in the same classroom for the active
semester, one with a published report card and one without, some attendance
rows, and one teacher with a teaching assignment. The dev box already has
classrooms, teachers and 615 asset units but **no students and no STUDENT
role** — so the fixtures below have to be created, and creating them is itself
part of the exercise.

---

## P1 — the exposure is closed

**The check that matters most.** Sign in as a student and try to read someone
else's record. Every one of these must fail to produce foreign data:

```bash
# as student A, with only the -own permissions
curl -s "$API/rapors"                            # 403 — no longer holds report-cards.read
curl -s "$API/rapors/me"                         # A's own, published only
curl -s "$API/rapors/me?studentId=<B's id>"      # unchanged — A's own
curl -s "$API/rapors/me/<B's report card id>"    # 404, not 403
curl -s "$API/academic/attendances/recap"        # 403 — a recap is about a cohort
curl -s "$API/students"                          # 403 — no longer holds students.read
curl -s "$API/students/<A's id>"                 # A's own record
curl -s "$API/students/<B's id>"                 # 403
```

Then confirm nothing changed for staff:

```bash
# as a staff account holding the management permissions
curl -s "$API/rapors" | jq '.meta.total'         # the school's count, as before
curl -s "$API/academic/attendances/recap" | jq   # as before
```

**The permissions exist without a seed** — the point of D4:

```bash
# after deploying, with no seed run
psql -c "SELECT code FROM permissions WHERE code LIKE '%.read-own' ORDER BY code"
# expect: attendances.read-own, report-cards.read-own, schedules.read-own,
#         student-scores.read-own, students.read-own
```

**Automated**:

```bash
pnpm --filter backend test          # contract tests per contracts/self-service-reads.md
pnpm --filter backend lint:strict
```

---

## P2 — the four screens show the student's own record

Sign in as student A in academic-web and visit each entry under *Akademik Saya*:

| Entry | Expect | Must not contain |
|---|---|---|
| Jadwal Pelajaran | A's classroom timetable, no classroom picker | any other classroom |
| Kehadiran | A's days and A's totals | any other student's name |
| Nilai | A's marks, including assessments not yet marked | a marking control |
| Rapor | A's published report card | generate, publish, delete, export-for-others |

The negative check is the one to run deliberately: open each screen and look for
a control that writes. FR-010 asks for absent, not disabled — a greyed-out
Publish button still tells a student the school is about to publish something.

Then the empty states, which are easier to get wrong than the populated ones:

- a student not enrolled in the active semester — each screen says so plainly
- a student whose marks are not yet entered — the assessments appear, blank
- a student whose report card exists but is unpublished — the screen says it is
  not available yet, not "no report card"

```bash
pnpm --filter academic-web test
pnpm --filter academic-web build
```

---

## P3 — the schedule survives a role the school invented

This is the check that would have caught the original defect:

1. Create a role — call it `GURU_HONORER` — through the role screen.
2. Grant it the same permissions the teaching role holds, including
   `schedules.read-own`.
3. Assign it to a teaching account **instead of** the built-in teacher role.
4. Sign in and open the schedule.

Expect that person's own teaching schedule. Before this slice they are shown the
administrator's classroom picker, because the screen compares their role name to
the literal `TEACHER`.

Also confirm:

- a staff account with no teaching record still gets the classroom picker
- an account that both teaches and administers can reach both

```bash
# the role-name branch is gone
grep -rn "roles.*includes\('TEACHER'\|roles.*includes\('STUDENT'" apps/academic/src
# expect: no matches
```

---

## Full gate before promotion

```bash
pnpm --filter backend validate      # format, lint, typecheck, lint:strict, test, build
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

Then the usual route: push to `dev`, let *Deploy to Development* finish, verify
there, and only then open the pull request to `main`. Six fixes are already
waiting on `dev`; this work sits on top of them and does not reorder them.
