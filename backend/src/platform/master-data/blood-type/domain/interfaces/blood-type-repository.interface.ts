import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../../../shared/domain/interfaces/repository.interface.js';
import { BloodTypeEntity } from '../entities/blood-type.entity.js';

export interface BloodTypeQueryInput extends PaginationQueryInput {
  search?: string;
  isActive?: boolean;
}

export abstract class IBloodTypeRepository {
  abstract findAll(
    query: BloodTypeQueryInput,
  ): Promise<PaginatedResult<BloodTypeEntity>>;

  abstract findById(id: string): Promise<BloodTypeEntity | null>;
  abstract findByName(
    name: string,
    excludeId?: string,
  ): Promise<BloodTypeEntity | null>;

  abstract create(data: {
    name: string;
    isActive?: boolean;
  }): Promise<BloodTypeEntity>;
  abstract update(
    id: string,
    data: { name?: string; isActive?: boolean },
  ): Promise<BloodTypeEntity>;

  abstract softDelete(id: string): Promise<BloodTypeEntity>;
}
