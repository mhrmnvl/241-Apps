import { InventoryFundingSourceEntity } from '../entities/funding-source.entity.js';

export abstract class IFundingSourceRepository {
  abstract findMany(search?: string): Promise<InventoryFundingSourceEntity[]>;
  abstract findById(id: string): Promise<InventoryFundingSourceEntity | null>;
  abstract create(data: {
    code: string;
    name: string;
    description?: string | null;
  }): Promise<InventoryFundingSourceEntity>;
  abstract update(
    id: string,
    data: { code?: string; name?: string; description?: string | null },
  ): Promise<InventoryFundingSourceEntity>;
  abstract delete(id: string): Promise<InventoryFundingSourceEntity>;
}
