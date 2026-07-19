import { InventoryStatus, Prisma } from '@prisma/client';

export abstract class IStatusRepository {
  abstract findMany(search?: string): Promise<InventoryStatus[]>;
  abstract findById(id: string): Promise<InventoryStatus | null>;
  abstract create(
    data: Prisma.InventoryStatusCreateInput,
  ): Promise<InventoryStatus>;
  abstract update(
    id: string,
    data: Prisma.InventoryStatusUpdateInput,
  ): Promise<InventoryStatus>;
  abstract delete(id: string): Promise<InventoryStatus>;
}
