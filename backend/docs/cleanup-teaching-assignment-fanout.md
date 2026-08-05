# Runbook — cleaning up fan-out teaching assignments

One-off remediation for data created by a bug that no longer exists in the
code. Read the whole page before running anything.

## What happened

The subject form used to offer a single "Guru Pengampu". Saving it called
`syncTeachingAssignments`, which created one `teaching_assignments` row for
**every classroom** — so picking one teacher for IPS assigned them to VII-A,
VII-B, VIII-A and so on at once.

That write path was removed in `fix(academic): show real teachers on the
subject list, per classroom`. Rows already written are **not** cleaned up by
the deploy; they have to be removed by hand.

## How it shows up

Editing one of those rows to point at a different classroom returns:

```json
{ "statusCode": 409, "message": "Teaching assignment already exists" }
```

The 409 is correct. `teaching_assignments` is unique on
`(teacher_id, classroom_id, subject_id, semester_id)`, and the fan-out
already consumed every classroom for that teacher and subject — so the
classroom you are moving to is taken by one of its own siblings.

## Before you start

- Take a database backup, or run inside a transaction you can roll back.
- **Schedules, assessment items and scores hang off a teaching assignment.**
  Removing a row that already carries them takes that data with it. Step 2
  exists to catch this — do not skip it.

## Step 1 — find the fan-out groups (read-only)

Each row returned is one teacher covering one subject across many classes.

```sql
SELECT
  ta.teacher_id,
  p.name   AS nama_guru,
  s.code   AS kode_mapel,
  ta.semester_id,
  COUNT(*) AS jumlah_kelas,
  STRING_AGG(COALESCE(c.name, c.code), ', ' ORDER BY c.code) AS daftar_kelas
FROM teaching_assignments ta
JOIN subjects   s ON s.id = ta.subject_id
JOIN classrooms c ON c.id = ta.classroom_id
JOIN teachers   t ON t.id = ta.teacher_id
LEFT JOIN users    u ON u.id = t.user_id
LEFT JOIN profiles p ON p.user_id = u.id
WHERE ta.deleted_at IS NULL
GROUP BY ta.teacher_id, p.name, s.code, ta.semester_id
HAVING COUNT(*) > 1
ORDER BY jumlah_kelas DESC;
```

A legitimate assignment can also span several classes, so a group here is not
automatically wrong. Judge it against what the teacher actually teaches.

## Step 2 — check what depends on each row (read-only, mandatory)

```sql
SELECT
  ta.id,
  s.code                   AS kode_mapel,
  COALESCE(c.name, c.code) AS kelas,
  p.name                   AS nama_guru,
  (SELECT COUNT(*) FROM schedules sc
     WHERE sc.teaching_assignment_id = ta.id AND sc.deleted_at IS NULL)
                           AS jumlah_jadwal,
  (SELECT COUNT(*) FROM assessment_items ai
     WHERE ai.teaching_assignment_id = ta.id)
                           AS jumlah_item_penilaian
FROM teaching_assignments ta
JOIN subjects   s ON s.id = ta.subject_id
JOIN classrooms c ON c.id = ta.classroom_id
JOIN teachers   t ON t.id = ta.teacher_id
LEFT JOIN users    u ON u.id = t.user_id
LEFT JOIN profiles p ON p.user_id = u.id
WHERE ta.deleted_at IS NULL
ORDER BY s.code, c.code;
```

Only rows where **both** counts are `0` are safe to remove. Anything else is
already carrying real data — leave it, or move the schedule first.

## Step 3 — soft-delete, one id at a time

```sql
UPDATE teaching_assignments
SET deleted_at = NOW()
WHERE id = '<id-from-step-2>'
  AND deleted_at IS NULL;
```

Soft delete, never `DELETE`. Two reasons: it is reversible, and
`CreateTeachingAssignmentUseCase` looks for a soft-deleted row before
inserting — so re-creating the same assignment later revives the original row
along with whatever hung off it, instead of orphaning it.

## Step 4 — verify

Re-run step 1. Only groups you intend to keep should remain. Then confirm in
the UI that editing a previously stuck assignment no longer returns 409.

## Afterwards

Assign teachers on **Pembelajaran › Penugasan Mengajar**, which now takes
several classes in one pass and skips classes that are already covered.
