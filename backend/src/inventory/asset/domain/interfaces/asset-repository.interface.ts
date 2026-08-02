import { DecimalValue } from '../../../../shared/domain/types/decimal.type.js';
import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../../shared/domain/interfaces/repository.interface.js';
import { InventoryAssetEntity } from '../entities/asset.entity.js';
import { AssetWithDetails } from '../entities/asset.entity.js';

export type { AssetWithDetails };

export interface AssetQueryInput extends PaginationQueryInput {
  keyword?: string;
  categoryId?: string;
  locationId?: string;
  statusId?: string;
  conditionId?: string;
  fundingSourceId?: string;
}

/** One physical unit seeded together with its parent asset. */
export interface CreateAssetUnitSeedInput {
  unitNumber: string;
  barcode: string;
  currentBookValue: DecimalValue;
  conditionId: string;
  statusId: string;
  locationId: string;
}

/**
 * Foreign keys are passed flat; translating them into the ORM's nested-write
 * form is the persistence adapter's job, not the caller's.
 */
export interface CreateAssetRepositoryInput {
  assetNumber: string;
  name: string;
  brand?: string | null;
  model?: string | null;
  purchaseDate: Date;
  purchasePrice: number;
  usefulLifeMonths?: number;
  notes?: string | null;
  categoryId: string;
  fundingSourceId?: string | null;
  units: CreateAssetUnitSeedInput[];
}

export interface UpdateAssetRepositoryInput {
  name?: string;
  brand?: string;
  model?: string;
  assetNumber?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  usefulLifeMonths?: number;
  notes?: string;
  categoryId?: string;
  /** `null` detaches the funding source; `undefined` leaves it untouched. */
  fundingSourceId?: string | null;
}

export abstract class IAssetRepository {
  abstract findAll(
    query: AssetQueryInput,
  ): Promise<PaginatedResult<AssetWithDetails>>;
  abstract findById(id: string): Promise<AssetWithDetails | null>;
  abstract findByCode(
    code: string,
    excludeId?: string,
  ): Promise<InventoryAssetEntity | null>;
  abstract create(input: CreateAssetRepositoryInput): Promise<AssetWithDetails>;
  abstract update(
    id: string,
    input: UpdateAssetRepositoryInput,
  ): Promise<AssetWithDetails>;
  abstract remove(id: string): Promise<InventoryAssetEntity>;
  abstract softDelete(id: string): Promise<InventoryAssetEntity>;
  abstract countUnits(id: string): Promise<number>;
  abstract findCategoryById(
    id: string,
  ): Promise<{ id: string; code: string } | null>;
  abstract findLatestAssetByPrefix(
    prefix: string,
  ): Promise<{ assetNumber: string } | null>;
}
