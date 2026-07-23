/*
  Warnings:

  - You are about to drop the column `school_unit_id` on the `admission_waves` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "admission_waves" DROP CONSTRAINT "admission_waves_school_unit_id_fkey";

-- AlterTable
ALTER TABLE "admission_waves" DROP COLUMN "school_unit_id";
