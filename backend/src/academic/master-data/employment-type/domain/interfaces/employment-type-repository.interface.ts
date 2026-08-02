import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../../../shared/domain/interfaces/repository.interface.js';
import { EmploymentTypeEntity } from '../entities/employment-type.entity.js';

export interface EmploymentTypeQueryInput extends PaginationQueryInput {
  search?: string;
}

export interface CreateEmploymentTypeRepositoryInput {
  code: string;
  name: string;
}

export interface UpdateEmploymentTypeRepositoryInput {
  name?: string;
}

export abstract class IEmploymentTypeRepository {
  abstract findAll(
    query: EmploymentTypeQueryInput,
  ): Promise<PaginatedResult<EmploymentTypeEntity>>;

  abstract findById(id: string): Promise<EmploymentTypeEntity | null>;

  abstract findByCode(
    code: string,
    excludeId?: string,
  ): Promise<EmploymentTypeEntity | null>;

  abstract create(
    dto: CreateEmploymentTypeRepositoryInput,
  ): Promise<EmploymentTypeEntity>;

  abstract update(
    id: string,
    dto: UpdateEmploymentTypeRepositoryInput,
  ): Promise<EmploymentTypeEntity>;

  abstract remove(id: string): Promise<EmploymentTypeEntity>;

  abstract countTeachersWithEmploymentType(id: string): Promise<number>;
}
