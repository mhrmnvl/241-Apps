import { InventoryCondition, Prisma } from '@prisma/client';

export abstract class IConditionRepository {
  abstract findMany(search?: string): Promise<InventoryCondition[]>;
  abstract findById(id: string): Promise<InventoryCondition | null>;
  abstract create(
    data: Prisma.InventoryConditionCreateInput,
  ): Promise<InventoryCondition>;
  abstract update(
    id: string,
    data: Prisma.InventoryConditionUpdateInput,
  ): Promise<InventoryCondition>;
  abstract delete(id: string): Promise<InventoryCondition>;
}
