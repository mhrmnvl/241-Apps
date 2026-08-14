-- Move the STUDENT role off the school-wide reads and onto self-service.
--
-- The seed granted it `students.read`, `attendances.read` and
-- `report-cards.read` — the same codes the management screens require — over
-- reads that took the caller as a parameter and never used it. A student
-- opening the menu the application gave them received every student's report
-- card, including scores, rank and the homeroom teacher's note, and the
-- attendance recap for the whole school.
--
-- The seed is corrected for fresh installs. This is for databases that already
-- ran it. Both of ours are no-ops today: neither has a STUDENT role at all.
-- That is timing, not safety — production is about to be populated through the
-- UI, and this must already be in place when it is.
--
-- Every statement is guarded, so running it against a database that has no
-- STUDENT role, or one already moved across, changes nothing.

-- 1. Revoke the three wide reads from the student role.
DELETE FROM "role_permissions" rp
USING "roles" r, "permissions" p
WHERE rp."role_id" = r."id"
  AND rp."permission_id" = p."id"
  AND r."code" = 'STUDENT'
  AND p."code" IN ('students.read', 'attendances.read', 'report-cards.read');

-- 2. Grant the five self-service reads in their place.
--
--    The permissions themselves are synced from the code-defined catalogue on
--    application bootstrap, so this runs after they exist on any box that has
--    booted the new build. Where a code is somehow absent the insert simply
--    finds no row to join — a missing grant, not a broken migration.
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT r."id", p."id"
FROM "roles" r
CROSS JOIN "permissions" p
WHERE r."code" = 'STUDENT'
  AND p."code" IN (
    'students.read-own',
    'attendances.read-own',
    'report-cards.read-own',
    'student-scores.read-own',
    'schedules.read-own'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM "role_permissions" existing
    WHERE existing."role_id" = r."id"
      AND existing."permission_id" = p."id"
  );

-- 3. Revoke the same three from PARENT, which held them identically and
--    reached the same reads — a guardian account could read every student's
--    report card.
--
--    Nothing is granted in their place. A parent's "own" is their child's
--    record, and which guardian may see which child is a question this system
--    has not answered. There is no parent surface today, so nothing is lost by
--    waiting for that answer; leaving the wide codes in place while removing
--    them from students would close the door for one role and hold it open for
--    another.
DELETE FROM "role_permissions" rp
USING "roles" r, "permissions" p
WHERE rp."role_id" = r."id"
  AND rp."permission_id" = p."id"
  AND r."code" = 'PARENT'
  AND p."code" IN ('students.read', 'attendances.read', 'report-cards.read');
