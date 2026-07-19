import { InventoryCategory, Prisma } from '@prisma/client';

export abstract class ICategoryRepository {
  abstract findMany(search?: string): Promise<InventoryCategory[]>;
  abstract findById(id: string): Promise<InventoryCategory | null>;
  abstract create(
    data: Prisma.InventoryCategoryCreateInput,
  ): Promise<InventoryCategory>;
  abstract update(
    id: string,
    data: Prisma.InventoryCategoryUpdateInput,
  ): Promise<InventoryCategory>;
  abstract delete(id: string): Promise<InventoryCategory>;
}
