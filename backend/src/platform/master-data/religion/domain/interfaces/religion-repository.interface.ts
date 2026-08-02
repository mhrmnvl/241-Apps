import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../../../shared/domain/interfaces/repository.interface.js';
import { ReligionEntity } from '../entities/religion.entity.js';

export interface ReligionQueryInput extends PaginationQueryInput {
  search?: string;
  isActive?: boolean;
}

export abstract class IReligionRepository {
  abstract findAll(
    query: ReligionQueryInput,
  ): Promise<PaginatedResult<ReligionEntity>>;

  abstract findById(id: string): Promise<ReligionEntity | null>;
  abstract findByName(
    name: string,
    excludeId?: string,
  ): Promise<ReligionEntity | null>;
  abstract create(data: {
    name: string;
    isActive?: boolean;
  }): Promise<ReligionEntity>;
  abstract update(
    id: string,
    data: { name?: string; isActive?: boolean },
  ): Promise<ReligionEntity>;
  abstract softDelete(id: string): Promise<ReligionEntity>;
}
