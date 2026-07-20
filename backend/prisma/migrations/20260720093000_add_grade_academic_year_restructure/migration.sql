-- CreateTable: GradeAcademicYear
CREATE TABLE "grade_academic_years" (
    "id" UUID NOT NULL,
    "grade_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "curriculum_id" UUID NOT NULL,

    CONSTRAINT "grade_academic_years_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "grade_academic_years_grade_id_academic_year_id_key" ON "grade_academic_years"("grade_id", "academic_year_id");
CREATE INDEX "grade_academic_years_academic_year_id_idx" ON "grade_academic_years"("academic_year_id");
CREATE INDEX "grade_academic_years_curriculum_id_idx" ON "grade_academic_years"("curriculum_id");

-- AddForeignKey
ALTER TABLE "grade_academic_years" ADD CONSTRAINT "grade_academic_years_grade_id_fkey" FOREIGN KEY ("grade_id") REFERENCES "grades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "grade_academic_years" ADD CONSTRAINT "grade_academic_years_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "grade_academic_years" ADD CONSTRAINT "grade_academic_years_curriculum_id_fkey" FOREIGN KEY ("curriculum_id") REFERENCES "curricula"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DropForeignKey: Classroom.curriculumId
ALTER TABLE "classrooms" DROP CONSTRAINT IF EXISTS "classrooms_curriculum_id_fkey";

-- DropIndex: classrooms curriculum_id
DROP INDEX IF EXISTS "classrooms_curriculum_id_idx";

-- AlterTable: Classroom — drop curriculum_id
ALTER TABLE "classrooms" DROP COLUMN IF EXISTS "curriculum_id";

-- DropIndex: curriculum_subjects old unique
DROP INDEX IF EXISTS "curriculum_subjects_curriculum_id_grade_id_subject_id_key";

-- DropForeignKey: CurriculumSubject.gradeId
ALTER TABLE "curriculum_subjects" DROP CONSTRAINT IF EXISTS "curriculum_subjects_grade_id_fkey";

-- DropIndex: curriculum_subjects grade_id
DROP INDEX IF EXISTS "curriculum_subjects_grade_id_idx";

-- AlterTable: CurriculumSubject — drop grade_id
ALTER TABLE "curriculum_subjects" DROP COLUMN IF EXISTS "grade_id";

-- CreateIndex: new unique on curriculum_subjects
CREATE UNIQUE INDEX "curriculum_subjects_curriculum_id_subject_id_key" ON "curriculum_subjects"("curriculum_id", "subject_id");
