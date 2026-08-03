import { DecimalValue } from '../../../../shared/domain/types/decimal.type.js';
import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../../shared/domain/interfaces/repository.interface.js';
import { InventoryAssetUnitEntity } from '../entities/asset-unit.entity.js';
import { AssetUnitWithDetails } from '../entities/asset-unit.entity.js';

export type { AssetUnitWithDetails };

export type AssetUnitQueryInput = PaginationQueryInput;

/**
 * Foreign keys are passed flat; translating them into the ORM's nested-write
 * form is the persistence adapter's job, not the caller's.
 */
export interface CreateAssetUnitRepositoryInput {
  assetId: string;
  unitNumber: string;
  barcode: string;
  currentBookValue: DecimalValue;
  conditionId: string;
  statusId: string;
  locationId: string;
  custodianId?: string | null;
  notes?: string | null;
}

export interface UpdateAssetUnitRepositoryInput {
  barcode?: string;
  notes?: string;
  custodianId?: string;
  conditionId?: string;
  statusId?: string;
  locationId?: string;
}

export abstract class IAssetUnitRepository {
  abstract findAll(
    query: AssetUnitQueryInput,
  ): Promise<PaginatedResult<AssetUnitWithDetails>>;
  abstract findById(id: string): Promise<AssetUnitWithDetails | null>;
  abstract findByUnitCode(
    unitCode: string,
    excludeId?: string,
  ): Promise<InventoryAssetUnitEntity | null>;
  abstract findByBarcode(
    barcode: string,
    excludeId?: string,
  ): Promise<InventoryAssetUnitEntity | null>;
  abstract create(
    input: CreateAssetUnitRepositoryInput,
  ): Promise<AssetUnitWithDetails>;
  abstract update(
    id: string,
    input: UpdateAssetUnitRepositoryInput,
  ): Promise<AssetUnitWithDetails>;
  abstract remove(id: string): Promise<InventoryAssetUnitEntity>;
  abstract softDelete(id: string): Promise<InventoryAssetUnitEntity>;
  abstract findLatestUnit(
    assetId: string,
  ): Promise<InventoryAssetUnitEntity | null>;
  abstract createMany(data: CreateAssetUnitRepositoryInput[]): Promise<number>;
  abstract findByAsset(assetId: string): Promise<AssetUnitWithDetails[]>;
}
