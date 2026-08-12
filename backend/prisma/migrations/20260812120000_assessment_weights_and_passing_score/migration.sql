-- =====================================================================
-- Assessment: configurable weights per assessment type, a passing score per curriculum subject
-- with an optional per-class override, and a frozen per-subject snapshot on
-- the report card.
--
-- Backfill matters here. A teaching assignment with no weight rows scores
-- every subject at nothing, so existing assignments are given a starting set:
--   * assignments that already have assessment items get an even split across
--     the types actually in use — the closest thing to the old behaviour,
--     where every item counted the same, and it never silently drops a type's
--     existing scores;
--   * assignments with no items yet get the conventional 40/30/30.
-- Teachers retune from there in the UI.
--
-- NOTE: requires gen_random_uuid() (built-in on PostgreSQL 13+).
-- Test on a database copy before running in production.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- AlterTable: the pass mark a curriculum sets for one of its subjects. On
-- CurriculumSubject rather than Subject: the subject catalogue is master data
-- and must not shift when a curriculum is retuned.
ALTER TABLE "curriculum_subjects" ADD COLUMN "passing_score" INTEGER NOT NULL DEFAULT 75;

-- AlterTable: a teacher's override of it, for one class only.
ALTER TABLE "teaching_assignments" ADD COLUMN "passing_score" INTEGER;

-- CreateTable
CREATE TABLE "assessment_weights" (
    "id" UUID NOT NULL,
    "teaching_assignment_id" UUID NOT NULL,
    "type" "AssessmentType" NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "assessment_weights_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "assessment_weights_teaching_assignment_id_idx" ON "assessment_weights"("teaching_assignment_id");
CREATE UNIQUE INDEX "assessment_weights_teaching_assignment_id_type_key" ON "assessment_weights"("teaching_assignment_id", "type");

ALTER TABLE "assessment_weights"
    ADD CONSTRAINT "assessment_weights_teaching_assignment_id_fkey"
    FOREIGN KEY ("teaching_assignment_id") REFERENCES "teaching_assignments"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "report_card_subjects" (
    "id" UUID NOT NULL,
    "report_card_id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "subject_code" VARCHAR(20),
    "subject_name" VARCHAR(100) NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "passing_score" INTEGER NOT NULL,
    "predicate" VARCHAR(2) NOT NULL,
    "description" VARCHAR(50) NOT NULL,
    "is_complete" BOOLEAN NOT NULL,

    CONSTRAINT "report_card_subjects_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "report_card_subjects_report_card_id_idx" ON "report_card_subjects"("report_card_id");
CREATE INDEX "report_card_subjects_subject_id_idx" ON "report_card_subjects"("subject_id");
CREATE UNIQUE INDEX "report_card_subjects_report_card_id_subject_id_key" ON "report_card_subjects"("report_card_id", "subject_id");

ALTER TABLE "report_card_subjects"
    ADD CONSTRAINT "report_card_subjects_report_card_id_fkey"
    FOREIGN KEY ("report_card_id") REFERENCES "report_cards"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "report_card_subjects"
    ADD CONSTRAINT "report_card_subjects_subject_id_fkey"
    FOREIGN KEY ("subject_id") REFERENCES "subjects"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- Backfill 1: assignments that already have items — even split over the types
-- in use. The remainder is handed to the earliest types so each assignment's
-- rows total exactly 100 and the editor does not open showing 99.99.
WITH used AS (
    SELECT DISTINCT ai."teaching_assignment_id" AS ta_id, ai."type" AS t
    FROM "assessment_items" ai
    WHERE ai."deleted_at" IS NULL
),
counted AS (
    SELECT
        ta_id,
        t,
        COUNT(*) OVER (PARTITION BY ta_id) AS n,
        ROW_NUMBER() OVER (PARTITION BY ta_id ORDER BY t) AS rn
    FROM used
)
INSERT INTO "assessment_weights" ("id", "teaching_assignment_id", "type", "weight")
SELECT
    gen_random_uuid(),
    ta_id,
    t,
    FLOOR(100 / n) + CASE WHEN rn <= 100 - FLOOR(100 / n) * n THEN 1 ELSE 0 END
FROM counted;

-- Backfill 2: everything else gets the conventional starting point.
INSERT INTO "assessment_weights" ("id", "teaching_assignment_id", "type", "weight")
SELECT gen_random_uuid(), ta."id", d.type::"AssessmentType", d.weight
FROM "teaching_assignments" ta
CROSS JOIN (
    VALUES ('DAILY', 40), ('MIDTERM', 30), ('FINAL', 30), ('ASSIGNMENT', 0), ('PRACTICAL', 0)
) AS d(type, weight)
WHERE ta."deleted_at" IS NULL
  AND NOT EXISTS (
      SELECT 1 FROM "assessment_weights" aw WHERE aw."teaching_assignment_id" = ta."id"
  );
