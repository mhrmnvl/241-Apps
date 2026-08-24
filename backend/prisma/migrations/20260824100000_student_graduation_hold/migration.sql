-- A final-year student the school decided not to graduate this year, and why.
--
-- Kept apart from `student_graduations` rather than folded into it as an
-- outcome flag: a graduation belongs to a student once (student_id is unique
-- there), while a hold belongs to a student *and a year*. The same student is
-- held in 2026/2027 and graduates in 2027/2028, and both facts have to survive.
CREATE TABLE "student_graduation_holds" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "decided_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_graduation_holds_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "student_graduation_holds_academic_year_id_idx" ON "student_graduation_holds"("academic_year_id");

-- One decision per student per year, so re-running the screen after a change of
-- mind rewrites the reason instead of stacking a second hold.
CREATE UNIQUE INDEX "student_graduation_holds_student_id_academic_year_id_key" ON "student_graduation_holds"("student_id", "academic_year_id");

ALTER TABLE "student_graduation_holds" ADD CONSTRAINT "student_graduation_holds_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "student_graduation_holds" ADD CONSTRAINT "student_graduation_holds_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
