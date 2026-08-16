-- Hours on a calendar entry, for the entries that have them.
--
-- The calendar's unit is the day: a term runs July to December, a holiday is
-- the 17th, and neither has a clock time. An activity does — a parents' meeting
-- is the 8th, 08:00 to 12:00 — and the previous entity carried timestamps for
-- exactly that reason.
--
-- Optional, and time-of-day rather than a full timestamp. Folding the hours
-- into the dates would make every holiday claim to start at midnight, and on a
-- multi-day activity time-of-day reads as "these hours, each day", which is how
-- a school describes it.
--
-- Nullable with no backfill: every existing entry genuinely has no hours, and
-- inventing 00:00 for them would be a claim the data never made.
ALTER TABLE "academic_calendars"
  ADD COLUMN "start_time" TIME(0),
  ADD COLUMN "end_time" TIME(0);
