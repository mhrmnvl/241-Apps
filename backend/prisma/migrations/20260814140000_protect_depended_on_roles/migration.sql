-- Mark the roles the code cannot run without as system roles.
--
-- `DeleteRoleUseCase` refuses a role only when `is_system` is true, and the
-- IAM seed created TEACHER and STUDENT with it false. Meanwhile the code
-- resolves both by this exact code and cannot proceed without them:
--
--   prisma-teacher.writer.ts          roleCode: 'TEACHER'
--   prisma-student.writer.ts          roleCode: 'STUDENT'
--   prisma-admission-application.repository.ts   findStudentRoleId()
--
-- So deleting either was permitted by the server, and prevented only by a
-- hardcoded list of role codes in two Vue files — which hid the button while
-- the endpoint kept accepting the request. Delete TEACHER and creating a
-- teacher stops working; delete STUDENT and student creation and admission
-- enrolment stop with it, each failing far from the role screen and with a
-- message that never mentions a role.
--
-- The seed is fixed for fresh installs. This is for the databases that already
-- ran it: dev holds TEACHER with is_system = false and one user assigned to
-- it. Production has only SUPER_ADMIN today, so this is a no-op there until
-- the IAM seed runs — and by then the seed is the corrected one.
--
-- Scoped to the two codes and to rows that are not already system, so it
-- cannot touch a role someone deliberately left custom.
UPDATE "roles"
SET "is_system" = true
WHERE "code" IN ('TEACHER', 'STUDENT')
  AND "is_system" = false;
