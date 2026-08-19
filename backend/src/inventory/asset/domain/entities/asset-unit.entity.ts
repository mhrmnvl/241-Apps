import type { CodedRef } from '../../../../shared/domain/entities/index.js';
import type { DecimalValue } from '../../../../shared/domain/types/decimal.type.js';

export interface InventoryAssetUnitEntity {
  id: string;
  assetId: string;
  unitNumber: string;
  barcode?: string | null;
  currentBookValue: DecimalValue;
  conditionId: string;
  statusId: string;
  locationId: string;
  custodianId?: string | null;
  notes?: string | null;
  deletedAt?: Date | null;
}

/**
 * The asset a unit belongs to, as a list row shows it.
 *
 * Deliberately not `InventoryAssetEntity`: that carries purchase price,
 * purchase date and book values, and a unit picker has no business receiving
 * them for every row it lists. Naming the three fields it does show means a
 * later narrowing fails to compile instead of quietly emptying a column.
 */
export interface AssetUnitAssetRef {
  id: string;
  assetNumber: string;
  name: string;
  category: CodedRef | null;
}

export interface AssetUnitWithDetails extends InventoryAssetUnitEntity {
  asset?: AssetUnitAssetRef;
  condition?: CodedRef;
  status?: CodedRef;
  location?: CodedRef;
}
