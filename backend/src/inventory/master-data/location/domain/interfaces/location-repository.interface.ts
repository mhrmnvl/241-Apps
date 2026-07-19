import { InventoryLocation, Prisma } from '@prisma/client';

export abstract class ILocationRepository {
  abstract findMany(search?: string): Promise<InventoryLocation[]>;
  abstract findById(id: string): Promise<InventoryLocation | null>;
  abstract create(
    data: Prisma.InventoryLocationCreateInput,
  ): Promise<InventoryLocation>;
  abstract update(
    id: string,
    data: Prisma.InventoryLocationUpdateInput,
  ): Promise<InventoryLocation>;
  abstract delete(id: string): Promise<InventoryLocation>;
}
