import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../../../shared/domain/interfaces/repository.interface.js';
import { SemesterTypeEntity } from '../entities/semester-type.entity.js';

export type { SemesterTypeEntity as SemesterType };

export interface SemesterTypeQueryInput extends PaginationQueryInput {
  search?: string;
  isActive?: boolean;
}

export interface CreateSemesterTypeRepositoryInput {
  name: string;
  isActive?: boolean;
}

export interface UpdateSemesterTypeRepositoryInput {
  name?: string;
  isActive?: boolean;
}

export abstract class ISemesterTypeRepository {
  abstract findAll(
    query: SemesterTypeQueryInput,
  ): Promise<PaginatedResult<SemesterTypeEntity>>;

  abstract findById(id: string): Promise<SemesterTypeEntity | null>;
  abstract findByName(
    name: string,
    excludeId?: string,
  ): Promise<SemesterTypeEntity | null>;

  abstract create(data: {
    name: string;
    isActive?: boolean;
  }): Promise<SemesterTypeEntity>;
  abstract update(
    id: string,
    data: { name?: string; isActive?: boolean },
  ): Promise<SemesterTypeEntity>;

  abstract softDelete(id: string): Promise<SemesterTypeEntity>;
  abstract remove(id: string): Promise<SemesterTypeEntity>;
  abstract delete(id: string): Promise<SemesterTypeEntity>;
  abstract hasRelatedData(id: string): Promise<boolean>;
}
