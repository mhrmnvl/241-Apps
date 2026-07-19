-- CreateEnum
CREATE TYPE "AssessmentType" AS ENUM ('DAILY', 'MIDTERM', 'FINAL', 'ASSIGNMENT', 'PRACTICAL');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'SICK');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('ACTIVE', 'PROMOTED', 'REPEATED', 'TRANSFERRED', 'DROPPED', 'GRADUATED');

-- CreateEnum
CREATE TYPE "IncomeRange" AS ENUM ('BELOW_500K', 'BETWEEN_500K_1M', 'BETWEEN_1M_2M', 'BETWEEN_2M_3M', 'ABOVE_3M');

-- CreateEnum
CREATE TYPE "ParentRelation" AS ENUM ('FATHER', 'MOTHER', 'GUARDIAN');

-- CreateEnum
CREATE TYPE "ScholarshipStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'REVOKED');

-- CreateEnum
CREATE TYPE "EducationStatus" AS ENUM ('GRADUATED', 'ACTIVE', 'TRANSFERRED', 'DROPPED');

-- CreateEnum
CREATE TYPE "UserGender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED');

-- CreateEnum
CREATE TYPE "SchoolUnitStatus" AS ENUM ('PRIVATE', 'PUBLIC');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('ACTIVE', 'TRANSFERRED', 'DROPPED', 'GRADUATED');

-- CreateEnum
CREATE TYPE "Day" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');

-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('TRIAL', 'ACTIVE', 'SUSPENDED', 'CANCELLED');

-- CreateTable
CREATE TABLE "academic_years" (
    "id" UUID NOT NULL,
    "school_unit_id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "academic_years_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "semesters" (
    "id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "type_id" UUID NOT NULL,
    "start_date" DATE,
    "end_date" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "semesters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_calendars" (
    "id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "semester_id" UUID,
    "title" VARCHAR(200) NOT NULL,
    "type_id" UUID NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "description" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "academic_calendars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curricula" (
    "id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "school_unit_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "curricula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_calendar_types" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "academic_calendar_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "semester_types" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "semester_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" UUID NOT NULL,
    "student_id" UUID,
    "teacher_id" UUID,
    "parent_id" UUID,
    "school_unit_id" UUID,
    "street" VARCHAR(255) NOT NULL,
    "rt" VARCHAR(5) NOT NULL,
    "rw" VARCHAR(5) NOT NULL,
    "village" VARCHAR(100) NOT NULL,
    "district" VARCHAR(100) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "province" VARCHAR(100) NOT NULL,
    "country" VARCHAR(100) NOT NULL DEFAULT 'Indonesia',
    "postal_code" VARCHAR(10) NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcement_classes" (
    "id" UUID NOT NULL,
    "announcement_id" UUID NOT NULL,
    "classroom_id" UUID NOT NULL,

    CONSTRAINT "announcement_classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_items" (
    "id" UUID NOT NULL,
    "teaching_assignment_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" "AssessmentType" NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "max_score" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "assessment_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_scores" (
    "id" UUID NOT NULL,
    "enrollment_id" UUID NOT NULL,
    "assessment_item_id" UUID NOT NULL,
    "score" DOUBLE PRECISION,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "student_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendances" (
    "id" UUID NOT NULL,
    "enrollment_id" UUID NOT NULL,
    "schedule_id" UUID,
    "date" DATE NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "note" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_cards" (
    "id" UUID NOT NULL,
    "enrollment_id" UUID NOT NULL,
    "total_average" DOUBLE PRECISION,
    "rank" INTEGER,
    "teacher_note" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "organization_id" UUID,
    "school_unit_id" UUID,
    "identifier" VARCHAR(100) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "user_agent" VARCHAR(512),
    "ip_address" VARCHAR(64),
    "expires_at" TIMESTAMP(3) NOT NULL,
    "last_used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classrooms" (
    "id" UUID NOT NULL,
    "curriculum_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "grade_id" UUID NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100),
    "capacity" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "classrooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classroom_supervisors" (
    "id" UUID NOT NULL,
    "classroom_id" UUID NOT NULL,
    "teacher_id" UUID NOT NULL,
    "semester_id" UUID NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "classroom_supervisors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classroom_structures" (
    "id" UUID NOT NULL,
    "classroom_id" UUID NOT NULL,
    "semester_id" UUID NOT NULL,
    "president_id" UUID,
    "vice_president_id" UUID,
    "secretary_id" UUID,
    "treasurer_id" UUID,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "classroom_structures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employment_types" (
    "id" UUID NOT NULL,
    "school_unit_id" UUID NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "employment_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_enrollments" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "classroom_id" UUID NOT NULL,
    "semester_id" UUID NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "enrolled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),
    "note" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "student_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_graduations" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "graduation_date" DATE,
    "certificate_no" VARCHAR(100),
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "student_graduations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audience_groups" (
    "id" UUID NOT NULL,
    "school_unit_id" UUID NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "audience_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_audiences" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "audience_group_id" UUID NOT NULL,

    CONSTRAINT "event_audiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL,
    "school_unit_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "start_time" TIMESTAMPTZ NOT NULL,
    "end_time" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_classes" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "classroom_id" UUID NOT NULL,

    CONSTRAINT "event_classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_categories" (
    "id" UUID NOT NULL,
    "organization_id" UUID,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "file_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "files" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "school_unit_id" UUID,
    "category_id" UUID,
    "uploaded_by" UUID,
    "filename" VARCHAR(255) NOT NULL,
    "original_name" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "storage_key" VARCHAR(500) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grades" (
    "id" UUID NOT NULL,
    "level" INTEGER NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "grades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "organization_id" UUID,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" UUID NOT NULL,
    "module" VARCHAR(50) NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "user_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "organization_id" UUID,
    "user_id" UUID,
    "action" VARCHAR(100) NOT NULL,
    "resource" VARCHAR(100) NOT NULL,
    "resource_id" UUID,
    "metadata" JSONB,
    "ip_address" VARCHAR(64),
    "user_agent" VARCHAR(512),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_types" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "organization_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "type_id" UUID,
    "name" VARCHAR(200) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255),
    "phone_number" VARCHAR(15),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parents" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "nik" VARCHAR(16) NOT NULL,
    "birth_place" VARCHAR(100) NOT NULL,
    "birth_date" DATE NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(15),
    "occupation_id" UUID NOT NULL,
    "education_id" UUID,
    "income" "IncomeRange",
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "parents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_parents" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "parent_id" UUID NOT NULL,
    "relation" "ParentRelation" NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "student_parents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_medias" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "base_url" VARCHAR(255) NOT NULL DEFAULT '',
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "social_medias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_social_medias" (
    "id" UUID NOT NULL,
    "social_media_id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "username" VARCHAR(100),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "profile_social_medias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_unit_social_medias" (
    "id" UUID NOT NULL,
    "social_media_id" UUID NOT NULL,
    "school_unit_id" UUID NOT NULL,
    "username" VARCHAR(100),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "school_unit_social_medias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "position_categories" (
    "id" UUID NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "position_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "positions" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "category_id" UUID NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_positions" (
    "id" UUID NOT NULL,
    "teacher_id" UUID NOT NULL,
    "position_id" UUID NOT NULL,
    "hire_date" DATE NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "teacher_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "level" VARCHAR(100) NOT NULL,
    "type_id" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "description" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scholarships" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "provider" VARCHAR(200) NOT NULL,
    "year" INTEGER NOT NULL,
    "status" "ScholarshipStatus" NOT NULL DEFAULT 'ACTIVE',
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "scholarships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "educational_histories" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "level" VARCHAR(50) NOT NULL,
    "institution" VARCHAR(200) NOT NULL,
    "major" VARCHAR(100),
    "start_year" INTEGER NOT NULL,
    "end_year" INTEGER,
    "status" "EducationStatus" NOT NULL DEFAULT 'ACTIVE',
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "educational_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievement_types" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "achievement_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "nik" VARCHAR(16) NOT NULL,
    "gender" "UserGender" NOT NULL,
    "birth_place" VARCHAR(100) NOT NULL,
    "birth_date" DATE NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(15),
    "religion_id" UUID,
    "blood_type_id" UUID,
    "marital_status" "MaritalStatus",
    "no_kk" VARCHAR(16),
    "npwp" VARCHAR(20),

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "religions" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "religions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blood_types" (
    "id" UUID NOT NULL,
    "name" VARCHAR(10) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "blood_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "occupations" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "occupations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "educations" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "educations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_unit_types" (
    "id" UUID NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "school_unit_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_units" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "type_id" UUID,
    "name" VARCHAR(200) NOT NULL,
    "surname" VARCHAR(200) NOT NULL,
    "nsm" VARCHAR(20) NOT NULL,
    "npsn" VARCHAR(20) NOT NULL,
    "status" "SchoolUnitStatus" NOT NULL,
    "npwp" VARCHAR(30) NOT NULL,
    "phone" VARCHAR(15) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "website" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "subdomain" VARCHAR(100),
    "custom_domain" VARCHAR(255),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "school_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "nis" VARCHAR(20) NOT NULL,
    "nisn" VARCHAR(20) NOT NULL,
    "status" "StudentStatus" NOT NULL DEFAULT 'ACTIVE',
    "grade_id" UUID,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" UUID NOT NULL,
    "school_unit_id" UUID NOT NULL,
    "code" VARCHAR(20),
    "name" VARCHAR(100) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curriculum_subjects" (
    "id" UUID NOT NULL,
    "curriculum_id" UUID NOT NULL,
    "grade_id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "hours_per_week" INTEGER NOT NULL DEFAULT 2,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "curriculum_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teachers" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "nip" VARCHAR(20),
    "nuptk" VARCHAR(20),
    "employment_type_id" UUID NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_slot_types" (
    "id" UUID NOT NULL,
    "school_unit_id" UUID NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "time_slot_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_slots" (
    "id" UUID NOT NULL,
    "school_unit_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "start_time" TIME(0) NOT NULL,
    "end_time" TIME(0) NOT NULL,
    "order" INTEGER NOT NULL,
    "type_id" UUID NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "time_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teaching_assignments" (
    "id" UUID NOT NULL,
    "teacher_id" UUID NOT NULL,
    "classroom_id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "semester_id" UUID NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "teaching_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedules" (
    "id" UUID NOT NULL,
    "teaching_assignment_id" UUID NOT NULL,
    "time_slot_id" UUID NOT NULL,
    "day" "Day" NOT NULL,
    "room" VARCHAR(50),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "storage_limit" BIGINT NOT NULL,
    "max_users" INTEGER NOT NULL,
    "max_school_units" INTEGER NOT NULL,
    "trial_days" INTEGER NOT NULL DEFAULT 14,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenants" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "plan_id" UUID NOT NULL,
    "status" "TenantStatus" NOT NULL DEFAULT 'TRIAL',
    "trial_ends_at" TIMESTAMP(3),
    "subscription_ends_at" TIMESTAMP(3),
    "logo_url" VARCHAR(500),
    "primary_color" VARCHAR(7),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "academic_years_school_unit_id_name_key" ON "academic_years"("school_unit_id", "name");

-- CreateIndex
CREATE INDEX "semesters_is_active_idx" ON "semesters"("is_active");

-- CreateIndex
CREATE INDEX "semesters_start_date_end_date_idx" ON "semesters"("start_date", "end_date");

-- CreateIndex
CREATE UNIQUE INDEX "semesters_academic_year_id_type_id_key" ON "semesters"("academic_year_id", "type_id");

-- CreateIndex
CREATE INDEX "curricula_school_unit_id_idx" ON "curricula"("school_unit_id");

-- CreateIndex
CREATE INDEX "curricula_academic_year_id_idx" ON "curricula"("academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "curricula_school_unit_id_academic_year_id_name_key" ON "curricula"("school_unit_id", "academic_year_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "academic_calendar_types_name_key" ON "academic_calendar_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "semester_types_name_key" ON "semester_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "announcement_classes_announcement_id_classroom_id_key" ON "announcement_classes"("announcement_id", "classroom_id");

-- CreateIndex
CREATE INDEX "assessment_items_teaching_assignment_id_idx" ON "assessment_items"("teaching_assignment_id");

-- CreateIndex
CREATE INDEX "student_scores_enrollment_id_idx" ON "student_scores"("enrollment_id");

-- CreateIndex
CREATE INDEX "student_scores_assessment_item_id_idx" ON "student_scores"("assessment_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_scores_enrollment_id_assessment_item_id_key" ON "student_scores"("enrollment_id", "assessment_item_id");

-- CreateIndex
CREATE INDEX "attendances_enrollment_id_idx" ON "attendances"("enrollment_id");

-- CreateIndex
CREATE INDEX "attendances_schedule_id_idx" ON "attendances"("schedule_id");

-- CreateIndex
CREATE UNIQUE INDEX "attendances_enrollment_id_date_schedule_id_key" ON "attendances"("enrollment_id", "date", "schedule_id");

-- CreateIndex
CREATE UNIQUE INDEX "report_cards_enrollment_id_key" ON "report_cards"("enrollment_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_school_unit_id_identifier_key" ON "users"("school_unit_id", "identifier");

-- CreateIndex
CREATE INDEX "auth_sessions_user_id_idx" ON "auth_sessions"("user_id");

-- CreateIndex
CREATE INDEX "auth_sessions_expires_at_idx" ON "auth_sessions"("expires_at");

-- CreateIndex
CREATE INDEX "auth_sessions_token_hash_idx" ON "auth_sessions"("token_hash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_token_hash_idx" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "classrooms_curriculum_id_idx" ON "classrooms"("curriculum_id");

-- CreateIndex
CREATE INDEX "classrooms_academic_year_id_idx" ON "classrooms"("academic_year_id");

-- CreateIndex
CREATE INDEX "classrooms_grade_id_idx" ON "classrooms"("grade_id");

-- CreateIndex
CREATE UNIQUE INDEX "classrooms_academic_year_id_grade_id_code_key" ON "classrooms"("academic_year_id", "grade_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "classroom_supervisors_classroom_id_semester_id_key" ON "classroom_supervisors"("classroom_id", "semester_id");

-- CreateIndex
CREATE UNIQUE INDEX "classroom_structures_classroom_id_semester_id_key" ON "classroom_structures"("classroom_id", "semester_id");

-- CreateIndex
CREATE UNIQUE INDEX "employment_types_school_unit_id_code_key" ON "employment_types"("school_unit_id", "code");

-- CreateIndex
CREATE INDEX "student_enrollments_classroom_id_idx" ON "student_enrollments"("classroom_id");

-- CreateIndex
CREATE INDEX "student_enrollments_semester_id_idx" ON "student_enrollments"("semester_id");

-- CreateIndex
CREATE INDEX "student_enrollments_status_idx" ON "student_enrollments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "student_enrollments_student_id_semester_id_key" ON "student_enrollments"("student_id", "semester_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_graduations_student_id_key" ON "student_graduations"("student_id");

-- CreateIndex
CREATE INDEX "student_graduations_academic_year_id_idx" ON "student_graduations"("academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "audience_groups_school_unit_id_code_key" ON "audience_groups"("school_unit_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "event_audiences_event_id_audience_group_id_key" ON "event_audiences"("event_id", "audience_group_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_classes_event_id_classroom_id_key" ON "event_classes"("event_id", "classroom_id");

-- CreateIndex
CREATE UNIQUE INDEX "file_categories_organization_id_code_key" ON "file_categories"("organization_id", "code");

-- CreateIndex
CREATE INDEX "files_organization_id_idx" ON "files"("organization_id");

-- CreateIndex
CREATE INDEX "files_school_unit_id_idx" ON "files"("school_unit_id");

-- CreateIndex
CREATE INDEX "files_category_id_idx" ON "files"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "grades_level_key" ON "grades"("level");

-- CreateIndex
CREATE UNIQUE INDEX "roles_organization_id_code_key" ON "roles"("organization_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "organization_types_code_key" ON "organization_types"("code");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_code_key" ON "organizations"("code");

-- CreateIndex
CREATE UNIQUE INDEX "parents_nik_key" ON "parents"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "student_parents_student_id_parent_id_key" ON "student_parents"("student_id", "parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "position_categories_code_key" ON "position_categories"("code");

-- CreateIndex
CREATE UNIQUE INDEX "positions_name_key" ON "positions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_positions_teacher_id_position_id_hire_date_key" ON "teacher_positions"("teacher_id", "position_id", "hire_date");

-- CreateIndex
CREATE UNIQUE INDEX "achievement_types_name_key" ON "achievement_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_nik_key" ON "profiles"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_email_key" ON "profiles"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_phone_key" ON "profiles"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "religions_name_key" ON "religions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "blood_types_name_key" ON "blood_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "occupations_name_key" ON "occupations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "educations_name_key" ON "educations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "school_unit_types_code_key" ON "school_unit_types"("code");

-- CreateIndex
CREATE UNIQUE INDEX "school_units_subdomain_key" ON "school_units"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "school_units_custom_domain_key" ON "school_units"("custom_domain");

-- CreateIndex
CREATE UNIQUE INDEX "school_units_organization_id_npsn_key" ON "school_units"("organization_id", "npsn");

-- CreateIndex
CREATE UNIQUE INDEX "students_user_id_key" ON "students"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_nis_key" ON "students"("nis");

-- CreateIndex
CREATE UNIQUE INDEX "students_nisn_key" ON "students"("nisn");

-- CreateIndex
CREATE INDEX "students_status_idx" ON "students"("status");

-- CreateIndex
CREATE INDEX "students_grade_id_idx" ON "students"("grade_id");

-- CreateIndex
CREATE INDEX "subjects_school_unit_id_idx" ON "subjects"("school_unit_id");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_school_unit_id_code_key" ON "subjects"("school_unit_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_school_unit_id_name_key" ON "subjects"("school_unit_id", "name");

-- CreateIndex
CREATE INDEX "curriculum_subjects_curriculum_id_idx" ON "curriculum_subjects"("curriculum_id");

-- CreateIndex
CREATE INDEX "curriculum_subjects_subject_id_idx" ON "curriculum_subjects"("subject_id");

-- CreateIndex
CREATE INDEX "curriculum_subjects_grade_id_idx" ON "curriculum_subjects"("grade_id");

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_subjects_curriculum_id_grade_id_subject_id_key" ON "curriculum_subjects"("curriculum_id", "grade_id", "subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_user_id_key" ON "teachers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_nip_key" ON "teachers"("nip");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_nuptk_key" ON "teachers"("nuptk");

-- CreateIndex
CREATE UNIQUE INDEX "time_slot_types_school_unit_id_code_key" ON "time_slot_types"("school_unit_id", "code");

-- CreateIndex
CREATE INDEX "teaching_assignments_teacher_id_idx" ON "teaching_assignments"("teacher_id");

-- CreateIndex
CREATE INDEX "teaching_assignments_classroom_id_idx" ON "teaching_assignments"("classroom_id");

-- CreateIndex
CREATE INDEX "teaching_assignments_subject_id_idx" ON "teaching_assignments"("subject_id");

-- CreateIndex
CREATE INDEX "teaching_assignments_semester_id_idx" ON "teaching_assignments"("semester_id");

-- CreateIndex
CREATE UNIQUE INDEX "teaching_assignments_teacher_id_classroom_id_subject_id_sem_key" ON "teaching_assignments"("teacher_id", "classroom_id", "subject_id", "semester_id");

-- CreateIndex
CREATE INDEX "schedules_teaching_assignment_id_idx" ON "schedules"("teaching_assignment_id");

-- CreateIndex
CREATE INDEX "schedules_time_slot_id_idx" ON "schedules"("time_slot_id");

-- CreateIndex
CREATE UNIQUE INDEX "schedules_teaching_assignment_id_day_time_slot_id_key" ON "schedules"("teaching_assignment_id", "day", "time_slot_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_code_key" ON "subscription_plans"("code");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE INDEX "tenants_slug_idx" ON "tenants"("slug");

-- AddForeignKey
ALTER TABLE "academic_years" ADD CONSTRAINT "academic_years_school_unit_id_fkey" FOREIGN KEY ("school_unit_id") REFERENCES "school_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "semesters" ADD CONSTRAINT "semesters_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "semesters" ADD CONSTRAINT "semesters_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "semester_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_calendars" ADD CONSTRAINT "academic_calendars_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_calendars" ADD CONSTRAINT "academic_calendars_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "semesters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_calendars" ADD CONSTRAINT "academic_calendars_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "academic_calendar_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curricula" ADD CONSTRAINT "curricula_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curricula" ADD CONSTRAINT "curricula_school_unit_id_fkey" FOREIGN KEY ("school_unit_id") REFERENCES "school_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_school_unit_id_fkey" FOREIGN KEY ("school_unit_id") REFERENCES "school_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "parents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcement_classes" ADD CONSTRAINT "announcement_classes_announcement_id_fkey" FOREIGN KEY ("announcement_id") REFERENCES "announcements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcement_classes" ADD CONSTRAINT "announcement_classes_classroom_id_fkey" FOREIGN KEY ("classroom_id") REFERENCES "classrooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_items" ADD CONSTRAINT "assessment_items_teaching_assignment_id_fkey" FOREIGN KEY ("teaching_assignment_id") REFERENCES "teaching_assignments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_scores" ADD CONSTRAINT "student_scores_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "student_enrollments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_scores" ADD CONSTRAINT "student_scores_assessment_item_id_fkey" FOREIGN KEY ("assessment_item_id") REFERENCES "assessment_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "student_enrollments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_cards" ADD CONSTRAINT "report_cards_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "student_enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_school_unit_id_fkey" FOREIGN KEY ("school_unit_id") REFERENCES "school_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classrooms" ADD CONSTRAINT "classrooms_curriculum_id_fkey" FOREIGN KEY ("curriculum_id") REFERENCES "curricula"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classrooms" ADD CONSTRAINT "classrooms_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classrooms" ADD CONSTRAINT "classrooms_grade_id_fkey" FOREIGN KEY ("grade_id") REFERENCES "grades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classroom_supervisors" ADD CONSTRAINT "classroom_supervisors_classroom_id_fkey" FOREIGN KEY ("classroom_id") REFERENCES "classrooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classroom_supervisors" ADD CONSTRAINT "classroom_supervisors_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classroom_supervisors" ADD CONSTRAINT "classroom_supervisors_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "semesters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classroom_structures" ADD CONSTRAINT "classroom_structures_classroom_id_fkey" FOREIGN KEY ("classroom_id") REFERENCES "classrooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classroom_structures" ADD CONSTRAINT "classroom_structures_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "semesters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classroom_structures" ADD CONSTRAINT "classroom_structures_president_id_fkey" FOREIGN KEY ("president_id") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classroom_structures" ADD CONSTRAINT "classroom_structures_vice_president_id_fkey" FOREIGN KEY ("vice_president_id") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classroom_structures" ADD CONSTRAINT "classroom_structures_secretary_id_fkey" FOREIGN KEY ("secretary_id") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classroom_structures" ADD CONSTRAINT "classroom_structures_treasurer_id_fkey" FOREIGN KEY ("treasurer_id") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employment_types" ADD CONSTRAINT "employment_types_school_unit_id_fkey" FOREIGN KEY ("school_unit_id") REFERENCES "school_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_classroom_id_fkey" FOREIGN KEY ("classroom_id") REFERENCES "classrooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "semesters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_enrollments" ADD CONSTRAINT "student_enrollments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_graduations" ADD CONSTRAINT "student_graduations_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_graduations" ADD CONSTRAINT "student_graduations_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audience_groups" ADD CONSTRAINT "audience_groups_school_unit_id_fkey" FOREIGN KEY ("school_unit_id") REFERENCES "school_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_audiences" ADD CONSTRAINT "event_audiences_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_audiences" ADD CONSTRAINT "event_audiences_audience_group_id_fkey" FOREIGN KEY ("audience_group_id") REFERENCES "audience_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_school_unit_id_fkey" FOREIGN KEY ("school_unit_id") REFERENCES "school_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_classes" ADD CONSTRAINT "event_classes_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_classes" ADD CONSTRAINT "event_classes_classroom_id_fkey" FOREIGN KEY ("classroom_id") REFERENCES "classrooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_categories" ADD CONSTRAINT "file_categories_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_school_unit_id_fkey" FOREIGN KEY ("school_unit_id") REFERENCES "school_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "file_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "organization_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parents" ADD CONSTRAINT "parents_occupation_id_fkey" FOREIGN KEY ("occupation_id") REFERENCES "occupations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parents" ADD CONSTRAINT "parents_education_id_fkey" FOREIGN KEY ("education_id") REFERENCES "educations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_parents" ADD CONSTRAINT "student_parents_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_parents" ADD CONSTRAINT "student_parents_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "parents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_social_medias" ADD CONSTRAINT "profile_social_medias_social_media_id_fkey" FOREIGN KEY ("social_media_id") REFERENCES "social_medias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_social_medias" ADD CONSTRAINT "profile_social_medias_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_unit_social_medias" ADD CONSTRAINT "school_unit_social_medias_social_media_id_fkey" FOREIGN KEY ("social_media_id") REFERENCES "social_medias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_unit_social_medias" ADD CONSTRAINT "school_unit_social_medias_school_unit_id_fkey" FOREIGN KEY ("school_unit_id") REFERENCES "school_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "positions" ADD CONSTRAINT "positions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "position_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_positions" ADD CONSTRAINT "teacher_positions_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_positions" ADD CONSTRAINT "teacher_positions_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "achievement_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scholarships" ADD CONSTRAINT "scholarships_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "educational_histories" ADD CONSTRAINT "educational_histories_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_religion_id_fkey" FOREIGN KEY ("religion_id") REFERENCES "religions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_blood_type_id_fkey" FOREIGN KEY ("blood_type_id") REFERENCES "blood_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_units" ADD CONSTRAINT "school_units_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_units" ADD CONSTRAINT "school_units_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "school_unit_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_grade_id_fkey" FOREIGN KEY ("grade_id") REFERENCES "grades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_school_unit_id_fkey" FOREIGN KEY ("school_unit_id") REFERENCES "school_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_subjects" ADD CONSTRAINT "curriculum_subjects_curriculum_id_fkey" FOREIGN KEY ("curriculum_id") REFERENCES "curricula"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_subjects" ADD CONSTRAINT "curriculum_subjects_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_subjects" ADD CONSTRAINT "curriculum_subjects_grade_id_fkey" FOREIGN KEY ("grade_id") REFERENCES "grades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_employment_type_id_fkey" FOREIGN KEY ("employment_type_id") REFERENCES "employment_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_slot_types" ADD CONSTRAINT "time_slot_types_school_unit_id_fkey" FOREIGN KEY ("school_unit_id") REFERENCES "school_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_slots" ADD CONSTRAINT "time_slots_school_unit_id_fkey" FOREIGN KEY ("school_unit_id") REFERENCES "school_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_slots" ADD CONSTRAINT "time_slots_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "time_slot_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teaching_assignments" ADD CONSTRAINT "teaching_assignments_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teaching_assignments" ADD CONSTRAINT "teaching_assignments_classroom_id_fkey" FOREIGN KEY ("classroom_id") REFERENCES "classrooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teaching_assignments" ADD CONSTRAINT "teaching_assignments_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teaching_assignments" ADD CONSTRAINT "teaching_assignments_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "semesters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_teaching_assignment_id_fkey" FOREIGN KEY ("teaching_assignment_id") REFERENCES "teaching_assignments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_time_slot_id_fkey" FOREIGN KEY ("time_slot_id") REFERENCES "time_slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
