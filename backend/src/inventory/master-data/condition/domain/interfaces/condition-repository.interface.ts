import { InventoryConditionEntity } from '../entities/condition.entity.js';

export abstract class IConditionRepository {
  abstract findMany(search?: string): Promise<InventoryConditionEntity[]>;
  abstract findById(id: string): Promise<InventoryConditionEntity | null>;
  abstract create(data: {
    code: string;
    name: string;
    isUsable?: boolean;
  }): Promise<InventoryConditionEntity>;
  abstract update(
    id: string,
    data: { code?: string; name?: string; isUsable?: boolean },
  ): Promise<InventoryConditionEntity>;
  abstract delete(id: string): Promise<InventoryConditionEntity>;
}
