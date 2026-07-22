import { InventoryAssetUnit, Prisma } from '@prisma/client';

export abstract class IAssetUnitRepository {
  abstract findById(id: string): Promise<InventoryAssetUnit | null>;
  abstract findByAsset(assetId: string): Promise<InventoryAssetUnit[]>;
  abstract findLatestUnit(assetId: string): Promise<InventoryAssetUnit | null>;
  abstract createMany(
    data: Prisma.InventoryAssetUnitCreateManyInput[],
  ): Promise<number>;
  abstract update(
    id: string,
    data: Prisma.InventoryAssetUnitUpdateInput,
  ): Promise<InventoryAssetUnit>;
  abstract softDelete(id: string): Promise<InventoryAssetUnit>;
}
