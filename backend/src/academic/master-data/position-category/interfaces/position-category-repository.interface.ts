import { PositionCategory } from '@prisma/client';
import {
  CreatePositionCategoryDto,
  UpdatePositionCategoryDto,
} from '../dto/request/create-position-category.dto.js';
import { PositionCategoryQueryDto } from '../dto/request/position-category-query.dto.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

export abstract class IPositionCategoryRepository {
  abstract findAll(
    query: PositionCategoryQueryDto,
  ): Promise<PaginatedResult<PositionCategory>>;

  abstract findById(id: string): Promise<PositionCategory | null>;
  abstract findByCode(
    code: string,
    excludeId?: string,
  ): Promise<PositionCategory | null>;

  abstract create(dto: CreatePositionCategoryDto): Promise<PositionCategory>;
  abstract update(
    id: string,
    dto: UpdatePositionCategoryDto,
  ): Promise<PositionCategory>;

  abstract remove(id: string): Promise<PositionCategory>;
  abstract countPositionsWithCategory(id: string): Promise<number>;
}
