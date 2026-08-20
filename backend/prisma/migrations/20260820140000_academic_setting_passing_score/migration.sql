-- The school's default pass mark, out of the code and into settings.
--
-- A subject's pass mark is normally read off the teaching assignment, and
-- failing that the curriculum. This is the last resort: a subject taught and
-- graded but never listed in the curriculum for that grade and year. That is a
-- data gap rather than a normal state, and grading through it beats refusing to
-- produce the report card at all.
--
-- 75 was a constant in report-card.constants.ts until now, which made a
-- school's choice into a code change. Plenty of madrasah set 70. The default
-- here matches the constant so nothing shifts underneath any report card
-- already issued; the constant stays as the fallback for a database with no
-- settings row.
ALTER TABLE "academic_settings"
  ADD COLUMN "default_passing_score" INTEGER NOT NULL DEFAULT 75;
