import { CodedRef } from '../../../../shared/domain/entities/reference.entity.js';
import { DecimalValue } from '../../../../shared/domain/types/decimal.type.js';

export interface InventoryAssetEntity {
  id: string;
  assetNumber: string;
  name: string;
  categoryId: string;
  fundingSourceId?: string | null;
  brand?: string | null;
  model?: string | null;
  purchaseDate: Date;
  purchasePrice: DecimalValue;
  usefulLifeMonths?: number | null;
  notes?: string | null;
  deletedAt?: Date | null;
}

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

export interface AssetWithDetails extends InventoryAssetEntity {
  category?: CodedRef;
  fundingSource?: CodedRef | null;
  units?: AssetUnitWithDetails[];
  _count?: { units?: number };
}

export interface AssetUnitWithDetails extends InventoryAssetUnitEntity {
  asset?: InventoryAssetEntity;
  condition?: CodedRef;
  status?: CodedRef;
  location?: CodedRef;
}
