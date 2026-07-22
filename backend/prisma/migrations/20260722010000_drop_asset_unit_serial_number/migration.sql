-- Remove the "Nomor Seri Pabrik" (factory serial number) field from asset
-- units — no longer collected/edited anywhere in the app.
ALTER TABLE "inventory_asset_units" DROP COLUMN "serial_number";
