import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../../../shared/domain/interfaces/repository.interface.js';
import { EducationEntity } from '../entities/education.entity.js';

export interface EducationQueryInput extends PaginationQueryInput {
  search?: string;
  isActive?: boolean;
}

export interface CreateEducationRepositoryInput {
  name: string;
  isActive?: boolean;
}

export type UpdateEducationRepositoryInput =
  Partial<CreateEducationRepositoryInput>;

export abstract class IEducationRepository {
  abstract findAll(
    query: EducationQueryInput,
  ): Promise<PaginatedResult<EducationEntity>>;

  abstract findById(id: string): Promise<EducationEntity | null>;

  abstract findByName(
    name: string,
    excludeId?: string,
  ): Promise<EducationEntity | null>;

  abstract findByCode(
    code: string,
    excludeId?: string,
  ): Promise<EducationEntity | null>;

  abstract create(
    input: CreateEducationRepositoryInput,
  ): Promise<EducationEntity>;

  abstract update(
    id: string,
    input: UpdateEducationRepositoryInput,
  ): Promise<EducationEntity>;

  abstract remove(id: string): Promise<EducationEntity>;

  abstract softDelete(id: string): Promise<EducationEntity>;

  abstract countParentUsage(id: string): Promise<number>;
}
