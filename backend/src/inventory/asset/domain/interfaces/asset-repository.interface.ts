import { InventoryAsset, Prisma } from '@prisma/client';
import { AssetQueryDto } from '../../dto/request/asset-query.dto.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

export abstract class IAssetRepository {
  abstract findAll(
    query: AssetQueryDto,
  ): Promise<PaginatedResult<InventoryAsset>>;
  abstract findById(id: string): Promise<InventoryAsset | null>;
  abstract create(
    data: Prisma.InventoryAssetCreateInput,
  ): Promise<InventoryAsset>;
  abstract update(
    id: string,
    data: Prisma.InventoryAssetUpdateInput,
  ): Promise<InventoryAsset>;
  abstract softDelete(id: string): Promise<InventoryAsset>;
  abstract findLatestAsset(): Promise<InventoryAsset | null>;
}
