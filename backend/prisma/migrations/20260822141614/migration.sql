-- DropIndex
DROP INDEX "student_scores_corrected_by_id_idx";

-- RenameForeignKey
ALTER TABLE "academic_calendar_classrooms" RENAME CONSTRAINT "academic_calendar_classrooms_calendar_id_fkey" TO "academic_calendar_classrooms_academic_calendar_id_fkey";

-- RenameIndex
ALTER INDEX "academic_calendar_classrooms_calendar_classroom_key" RENAME TO "academic_calendar_classrooms_academic_calendar_id_classroom_key";
