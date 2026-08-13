-- Term order within an academic year, recorded rather than derived.
--
-- Lists ordered by `name`, which sorts the English enum alphabetically: EVEN
-- before ODD, so every screen showed Genap above Ganjil. Semester types are
-- editable master data, so any ordering that reads the name breaks on a rename
-- or a third type.
--
-- New rows default to 99 — the end — until someone places them deliberately.
ALTER TABLE "semester_types" ADD COLUMN "sequence" INTEGER NOT NULL DEFAULT 99;

-- Backfill the two terms an Indonesian school year has, by the name the seed
-- gives them. Anything else keeps 99 and sorts last rather than being guessed.
UPDATE "semester_types" SET "sequence" = 1 WHERE "name" = 'ODD';
UPDATE "semester_types" SET "sequence" = 2 WHERE "name" = 'EVEN';
