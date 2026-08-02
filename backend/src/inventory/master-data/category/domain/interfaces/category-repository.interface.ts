import { InventoryCategoryEntity } from '../entities/category.entity.js';

export abstract class ICategoryRepository {
  abstract findMany(search?: string): Promise<InventoryCategoryEntity[]>;
  abstract findById(id: string): Promise<InventoryCategoryEntity | null>;
  abstract create(data: {
    code: string;
    name: string;
    depreciationRatePercent?: number;
  }): Promise<InventoryCategoryEntity>;
  abstract update(
    id: string,
    data: { code?: string; name?: string; depreciationRatePercent?: number },
  ): Promise<InventoryCategoryEntity>;
  abstract delete(id: string): Promise<InventoryCategoryEntity>;
}
