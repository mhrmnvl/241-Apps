-- The calendar year a school year opens in, recorded rather than parsed.
--
-- The promotion screen needs to know which year follows the active one so it
-- can stop asking. Names are the only ordering this table had, and academic
-- years are master data the school edits: "TA 2027-2028" or a curriculum
-- suffix would break the derivation silently, in an operation that moves a
-- whole cohort once a year. `SemesterType.sequence` was added for exactly this,
-- and its comment says so.
ALTER TABLE "academic_years" ADD COLUMN "start_year" INTEGER;

-- Backfilled from the leading four digits of the name, which is the format in
-- use ("2026/2027"). A row whose name carries no four-digit year fails the NOT
-- NULL below rather than being given a number that would order it wrongly —
-- finding that out here is better than finding it out mid-promotion.
UPDATE "academic_years"
SET "start_year" = (substring("name" from '\d{4}'))::int
WHERE "name" ~ '\d{4}';

ALTER TABLE "academic_years" ALTER COLUMN "start_year" SET NOT NULL;

-- Ordering is the whole point, and it runs on every promotion.
CREATE INDEX "academic_years_start_year_idx" ON "academic_years"("start_year");
