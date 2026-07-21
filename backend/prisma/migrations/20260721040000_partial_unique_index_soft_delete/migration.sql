-- Drop old global unique indexes, replace with partial unique indexes (WHERE deleted_at IS NULL)
-- This allows soft-deleted records to share unique field values with active records.

-- subjects: code, name
DROP INDEX IF EXISTS "subjects_code_key";
DROP INDEX IF EXISTS "subjects_name_key";
CREATE UNIQUE INDEX "subjects_code_unique_active" ON "subjects"("code") WHERE "deleted_at" IS NULL AND "code" IS NOT NULL;
CREATE UNIQUE INDEX "subjects_name_unique_active" ON "subjects"("name") WHERE "deleted_at" IS NULL;

-- curriculum_subjects: (curriculum_id, subject_id)
DROP INDEX IF EXISTS "curriculum_subjects_curriculum_id_subject_id_key";
CREATE UNIQUE INDEX "curriculum_subjects_curriculum_id_subject_id_unique_active"
  ON "curriculum_subjects"("curriculum_id", "subject_id") WHERE "deleted_at" IS NULL;

-- teachers: nip, nuptk
DROP INDEX IF EXISTS "teachers_nip_key";
DROP INDEX IF EXISTS "teachers_nuptk_key";
CREATE UNIQUE INDEX "teachers_nip_unique_active" ON "teachers"("nip") WHERE "deleted_at" IS NULL AND "nip" IS NOT NULL;
CREATE UNIQUE INDEX "teachers_nuptk_unique_active" ON "teachers"("nuptk") WHERE "deleted_at" IS NULL AND "nuptk" IS NOT NULL;

-- students: nis, nisn
DROP INDEX IF EXISTS "students_nis_key";
DROP INDEX IF EXISTS "students_nisn_key";
CREATE UNIQUE INDEX "students_nis_unique_active" ON "students"("nis") WHERE "deleted_at" IS NULL;
CREATE UNIQUE INDEX "students_nisn_unique_active" ON "students"("nisn") WHERE "deleted_at" IS NULL;

-- parents: nik
DROP INDEX IF EXISTS "parents_nik_key";
CREATE UNIQUE INDEX "parents_nik_unique_active" ON "parents"("nik") WHERE "deleted_at" IS NULL;

-- student_parents: (student_id, parent_id)
DROP INDEX IF EXISTS "student_parents_student_id_parent_id_key";
CREATE UNIQUE INDEX "student_parents_student_id_parent_id_unique_active"
  ON "student_parents"("student_id", "parent_id") WHERE "deleted_at" IS NULL;

-- time_slot_types: code
DROP INDEX IF EXISTS "time_slot_types_code_key";
CREATE UNIQUE INDEX "time_slot_types_code_unique_active" ON "time_slot_types"("code") WHERE "deleted_at" IS NULL;

-- teaching_assignments: (teacher_id, classroom_id, subject_id, semester_id)
DROP INDEX IF EXISTS "teaching_assignments_teacher_id_classroom_id_subject_id_semester_id_key";
CREATE UNIQUE INDEX "teaching_assignments_unique_active"
  ON "teaching_assignments"("teacher_id", "classroom_id", "subject_id", "semester_id") WHERE "deleted_at" IS NULL;

-- schedules: (teaching_assignment_id, day, time_slot_id)
DROP INDEX IF EXISTS "schedules_teaching_assignment_id_day_time_slot_id_key";
CREATE UNIQUE INDEX "schedules_unique_active"
  ON "schedules"("teaching_assignment_id", "day", "time_slot_id") WHERE "deleted_at" IS NULL;

-- student_enrollments: (student_id, semester_id)
DROP INDEX IF EXISTS "student_enrollments_student_id_semester_id_key";
CREATE UNIQUE INDEX "student_enrollments_student_id_semester_id_unique_active"
  ON "student_enrollments"("student_id", "semester_id") WHERE "deleted_at" IS NULL;
