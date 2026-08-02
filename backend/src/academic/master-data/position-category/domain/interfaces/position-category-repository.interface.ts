import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../../../shared/domain/interfaces/repository.interface.js';
import { PositionCategoryEntity } from '../entities/position-category.entity.js';

export interface PositionCategoryQueryInput extends PaginationQueryInput {
  search?: string;
}

export interface CreatePositionCategoryRepositoryInput {
  code: string;
  name: string;
}

export interface UpdatePositionCategoryRepositoryInput {
  name?: string;
}

export abstract class IPositionCategoryRepository {
  abstract findAll(
    query?: PositionCategoryQueryInput,
  ): Promise<
    PositionCategoryEntity[] | PaginatedResult<PositionCategoryEntity>
  >;

  abstract findById(id: string): Promise<PositionCategoryEntity | null>;

  abstract findByCode(
    code: string,
    excludeId?: string,
  ): Promise<PositionCategoryEntity | null>;

  abstract create(
    dto: CreatePositionCategoryRepositoryInput,
  ): Promise<PositionCategoryEntity>;

  abstract update(
    id: string,
    dto: UpdatePositionCategoryRepositoryInput,
  ): Promise<PositionCategoryEntity>;

  abstract remove(id: string): Promise<PositionCategoryEntity>;

  abstract countPositionsWithCategory(id: string): Promise<number>;
}
