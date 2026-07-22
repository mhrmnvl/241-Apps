-- =====================================================================
-- Inventory: split InventoryAsset (parent/definition) and InventoryAssetUnit (physical unit)
-- Per-unit fields (barcode, serial, condition, status, location, custodian, book value)
-- move to the new unit table. Loan items & histories repoint asset_id -> unit_id.
-- Legacy: each existing asset -> 1 unit whose unit_number = the old asset_number
-- (so physical labels stay valid); the asset keeps its asset_number as the batch code.
-- NOTE: requires gen_random_uuid() (built-in on PostgreSQL 13+).
-- Test on a database copy before running in production.
-- =====================================================================

-- Ensure gen_random_uuid() is available (built-in on PG13+; pgcrypto otherwise).
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- CreateTable
CREATE TABLE "inventory_asset_units" (
    "id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "unit_number" VARCHAR(50) NOT NULL,
    "barcode" VARCHAR(100),
    "serial_number" VARCHAR(100),
    "residual_value" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "current_book_value" DECIMAL(15,2) NOT NULL,
    "condition_id" UUID NOT NULL,
    "status_id" UUID NOT NULL,
    "location_id" UUID NOT NULL,
    "custodian_id" UUID,
    "notes" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "inventory_asset_units_pkey" PRIMARY KEY ("id")
);

-- Backfill: one unit per existing asset (unit_number = old asset_number)
INSERT INTO "inventory_asset_units" (
    "id", "asset_id", "unit_number", "barcode", "serial_number",
    "residual_value", "current_book_value", "condition_id", "status_id",
    "location_id", "custodian_id", "notes", "version", "created_at", "updated_at", "deleted_at"
)
SELECT
    gen_random_uuid(), a."id", a."asset_number", a."barcode", a."serial_number",
    a."residual_value", a."current_book_value", a."condition_id", a."status_id",
    a."location_id", a."custodian_id", NULL, 1, a."created_at", a."updated_at", a."deleted_at"
FROM "inventory_assets" a;

-- Repoint inventory_loan_items.asset_id -> unit_id
ALTER TABLE "inventory_loan_items" ADD COLUMN "unit_id" UUID;
UPDATE "inventory_loan_items" li
SET "unit_id" = u."id"
FROM "inventory_asset_units" u
WHERE u."asset_id" = li."asset_id";
ALTER TABLE "inventory_loan_items" ALTER COLUMN "unit_id" SET NOT NULL;
ALTER TABLE "inventory_loan_items" DROP CONSTRAINT "inventory_loan_items_asset_id_fkey";
ALTER TABLE "inventory_loan_items" DROP COLUMN "asset_id";

-- Repoint inventory_histories.asset_id -> unit_id
ALTER TABLE "inventory_histories" ADD COLUMN "unit_id" UUID;
UPDATE "inventory_histories" h
SET "unit_id" = u."id"
FROM "inventory_asset_units" u
WHERE u."asset_id" = h."asset_id";
ALTER TABLE "inventory_histories" ALTER COLUMN "unit_id" SET NOT NULL;
ALTER TABLE "inventory_histories" DROP CONSTRAINT "inventory_histories_asset_id_fkey";
ALTER TABLE "inventory_histories" DROP COLUMN "asset_id";

-- Drop moved columns (and their FKs) from inventory_assets
ALTER TABLE "inventory_assets" DROP CONSTRAINT "inventory_assets_location_id_fkey";
ALTER TABLE "inventory_assets" DROP CONSTRAINT "inventory_assets_condition_id_fkey";
ALTER TABLE "inventory_assets" DROP CONSTRAINT "inventory_assets_status_id_fkey";
ALTER TABLE "inventory_assets"
    DROP COLUMN "barcode",
    DROP COLUMN "serial_number",
    DROP COLUMN "residual_value",
    DROP COLUMN "current_book_value",
    DROP COLUMN "condition_id",
    DROP COLUMN "status_id",
    DROP COLUMN "location_id",
    DROP COLUMN "custodian_id";

-- Unique indexes on the unit table
CREATE UNIQUE INDEX "inventory_asset_units_unit_number_key" ON "inventory_asset_units"("unit_number");
CREATE UNIQUE INDEX "inventory_asset_units_barcode_key" ON "inventory_asset_units"("barcode");

-- Foreign keys for the unit table
ALTER TABLE "inventory_asset_units" ADD CONSTRAINT "inventory_asset_units_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "inventory_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "inventory_asset_units" ADD CONSTRAINT "inventory_asset_units_condition_id_fkey" FOREIGN KEY ("condition_id") REFERENCES "inventory_conditions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "inventory_asset_units" ADD CONSTRAINT "inventory_asset_units_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "inventory_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "inventory_asset_units" ADD CONSTRAINT "inventory_asset_units_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "inventory_locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Foreign keys for repointed tables
ALTER TABLE "inventory_histories" ADD CONSTRAINT "inventory_histories_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "inventory_asset_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "inventory_loan_items" ADD CONSTRAINT "inventory_loan_items_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "inventory_asset_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
