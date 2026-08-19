import { DecimalValue } from '../../../../shared/domain/types/decimal.type.js';
import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../../shared/domain/interfaces/repository.interface.js';
import { InventoryAssetUnitEntity } from '../entities/asset-unit.entity.js';
import { AssetUnitWithDetails } from '../entities/asset-unit.entity.js';

export type { AssetUnitWithDetails };

export interface AssetUnitQueryInput extends PaginationQueryInput {
  /**
   * Restrict to units that may take part in a transaction — what a loan form
   * is asking for when it asks for "available units".
   *
   * The rule is the status's `allowTransactions`, and it is complete on its
   * own: raising a loan moves its units to LOAN_PENDING and approving it moves
   * them to LOANED, both of which forbid transactions. So a unit already
   * spoken for is excluded by the same condition, without a second query
   * against open loans.
   */
  lendable?: boolean;
  /** Matches the unit number or the asset's name. */
  search?: string;
}

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
