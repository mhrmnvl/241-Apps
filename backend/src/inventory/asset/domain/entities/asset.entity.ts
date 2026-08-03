import type { CodedRef } from '../../../../shared/domain/entities/index.js';
import type { DecimalValue } from '../../../../shared/domain/types/decimal.type.js';
import type { AssetUnitWithDetails } from './asset-unit.entity.js';

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

export interface AssetWithDetails extends InventoryAssetEntity {
  category?: CodedRef;
  fundingSource?: CodedRef | null;
  units?: AssetUnitWithDetails[];
  _count?: { units?: number };
}
