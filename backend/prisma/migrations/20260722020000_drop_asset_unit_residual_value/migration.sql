-- Remove "residualValue" (nilai residu/salvage value) from asset units — dead
-- column, never set/read/displayed anywhere in the app.
ALTER TABLE "inventory_asset_units" DROP COLUMN "residual_value";
