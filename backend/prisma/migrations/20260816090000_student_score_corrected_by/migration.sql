-- Who last changed a mark, when it was not the teacher assigned to teach it.
--
-- A homeroom teacher may correct any mark in the class they supervise, and an
-- administrator may correct anything. Both are legitimate; both are also the
-- kind of change a school has to be able to account for later. `updated_at`
-- alone cannot: a mark the subject teacher revised and a mark someone else
-- overwrote look exactly the same in it.
--
-- Null is the ordinary case — the subject teacher entered it — so no backfill
-- is needed or wanted. Marks that already exist were entered by whoever the
-- data does not record, and inventing an author for them would be worse than
-- leaving the column empty.
ALTER TABLE "student_scores"
  ADD COLUMN "corrected_by_id" UUID,
  ADD COLUMN "corrected_at" TIMESTAMP(3);

ALTER TABLE "student_scores"
  ADD CONSTRAINT "student_scores_corrected_by_id_fkey"
  FOREIGN KEY ("corrected_by_id") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "student_scores_corrected_by_id_idx"
  ON "student_scores"("corrected_by_id");
