-- Move the teaching week off the academic year and into school-wide settings.
--
-- The previous migration put `weekly_holidays` on `academic_years`, which made
-- it something to re-answer every July. It is not a fact about a year; it is
-- how this school runs, and it belongs in one place that outlives any of them.
--
-- One row, and the database says so. `singleton` carries a unique index on a
-- column that can only hold `true`, so a second settings row is rejected
-- outright rather than left for the next reader to discover as two answers to
-- the same question.
CREATE TABLE "academic_settings" (
  "id"              UUID         NOT NULL,
  "singleton"       BOOLEAN      NOT NULL DEFAULT true,
  "weekly_holidays" INTEGER[]    NOT NULL DEFAULT ARRAY[0],
  "created_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"      TIMESTAMP(3) NOT NULL,

  CONSTRAINT "academic_settings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "academic_settings_singleton_key"
  ON "academic_settings"("singleton");

-- Carry over whatever was already answered rather than resetting to the
-- default: the active year holds the only version of this anyone has set.
INSERT INTO "academic_settings" ("id", "weekly_holidays", "updated_at")
SELECT
  gen_random_uuid(),
  COALESCE(
    (
      SELECT "weekly_holidays"
      FROM "academic_years"
      WHERE "is_active" = true AND "deleted_at" IS NULL
      LIMIT 1
    ),
    ARRAY[0]
  ),
  CURRENT_TIMESTAMP;

ALTER TABLE "academic_years" DROP COLUMN "weekly_holidays";
