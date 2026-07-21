/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `subjects` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "subjects_code_unique_active";

-- DropIndex
DROP INDEX "teaching_assignments_teacher_id_classroom_id_subject_id_sem_key";

-- AlterTable
ALTER TABLE "time_slot_types" ADD COLUMN     "days" "Day"[] DEFAULT ARRAY[]::"Day"[],
ADD COLUMN     "is_lesson" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "subjects_code_key" ON "subjects"("code") WHERE ("deleted_at" IS NULL);

-- RenameIndex
ALTER INDEX "curriculum_subjects_curriculum_id_subject_id_unique_active" RENAME TO "curriculum_subjects_curriculum_id_subject_id_key";

-- RenameIndex
ALTER INDEX "parents_nik_unique_active" RENAME TO "parents_nik_key";

-- RenameIndex
ALTER INDEX "schedules_unique_active" RENAME TO "schedules_teaching_assignment_id_day_time_slot_id_key";

-- RenameIndex
ALTER INDEX "student_enrollments_student_id_semester_id_unique_active" RENAME TO "student_enrollments_student_id_semester_id_key";

-- RenameIndex
ALTER INDEX "student_parents_student_id_parent_id_unique_active" RENAME TO "student_parents_student_id_parent_id_key";

-- RenameIndex
ALTER INDEX "students_nis_unique_active" RENAME TO "students_nis_key";

-- RenameIndex
ALTER INDEX "students_nisn_unique_active" RENAME TO "students_nisn_key";

-- RenameIndex
ALTER INDEX "subjects_name_unique_active" RENAME TO "subjects_name_key";

-- RenameIndex
ALTER INDEX "teachers_nip_unique_active" RENAME TO "teachers_nip_key";

-- RenameIndex
ALTER INDEX "teachers_nuptk_unique_active" RENAME TO "teachers_nuptk_key";

-- RenameIndex
ALTER INDEX "time_slot_types_code_unique_active" RENAME TO "time_slot_types_code_key";
