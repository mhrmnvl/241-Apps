-- =====================================================================
-- Inventory: protected "system role" tag for InventoryStatus.
-- The loan lifecycle (create/approve/reject/return) needs to reliably find
-- "the status that means Available/LoanPending/..." without depending on the
-- free-text code/name, which admins can freely relabel via Referensi >
-- Status Aset. This adds an optional, unique systemKey enum column that an
-- admin assigns to one of their existing statuses to mark its role.
-- Existing rows get systemKey = NULL; assign them via the status edit form.
-- =====================================================================

-- CreateEnum
CREATE TYPE "InventoryStatusKey" AS ENUM ('AVAILABLE', 'LOAN_PENDING', 'LOAN_APPROVED', 'LOANED', 'LOAN_RETURNED', 'LOAN_REJECTED');

-- AlterTable
ALTER TABLE "inventory_statuses" ADD COLUMN "system_key" "InventoryStatusKey";

-- CreateIndex
CREATE UNIQUE INDEX "inventory_statuses_system_key_key" ON "inventory_statuses"("system_key");
