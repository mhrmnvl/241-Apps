import { InventoryFundingSource, Prisma } from '@prisma/client';

export abstract class IFundingSourceRepository {
  abstract findMany(search?: string): Promise<InventoryFundingSource[]>;
  abstract findById(id: string): Promise<InventoryFundingSource | null>;
  abstract create(
    data: Prisma.InventoryFundingSourceCreateInput,
  ): Promise<InventoryFundingSource>;
  abstract update(
    id: string,
    data: Prisma.InventoryFundingSourceUpdateInput,
  ): Promise<InventoryFundingSource>;
  abstract delete(id: string): Promise<InventoryFundingSource>;
}
