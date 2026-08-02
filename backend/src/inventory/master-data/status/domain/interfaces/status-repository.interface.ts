import { InventoryStatusKey } from '../../../../../shared/domain/enums/inventory-status-key.enum.js';
import { InventoryStatusEntity } from '../entities/status.entity.js';

export interface CreateStatusRepositoryInput {
  code: string;
  name: string;
  systemKey?: `${InventoryStatusKey}` | null;
  allowTransactions?: boolean;
}

export type UpdateStatusRepositoryInput = Partial<CreateStatusRepositoryInput>;

export abstract class IStatusRepository {
  abstract findMany(search?: string): Promise<InventoryStatusEntity[]>;
  abstract findById(id: string): Promise<InventoryStatusEntity | null>;
  abstract create(
    data: CreateStatusRepositoryInput,
  ): Promise<InventoryStatusEntity>;
  abstract update(
    id: string,
    data: UpdateStatusRepositoryInput,
  ): Promise<InventoryStatusEntity>;
  abstract delete(id: string): Promise<InventoryStatusEntity>;
}
