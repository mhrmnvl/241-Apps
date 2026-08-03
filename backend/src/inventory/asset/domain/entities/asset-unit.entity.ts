import type { CodedRef } from '../../../../shared/domain/entities/index.js';
import type { DecimalValue } from '../../../../shared/domain/types/decimal.type.js';
import type { InventoryAssetEntity } from './asset.entity.js';

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

export interface AssetUnitWithDetails extends InventoryAssetUnitEntity {
  asset?: InventoryAssetEntity;
  condition?: CodedRef;
  status?: CodedRef;
  location?: CodedRef;
}
