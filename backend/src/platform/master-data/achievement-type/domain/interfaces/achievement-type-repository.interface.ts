import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../../../shared/domain/interfaces/repository.interface.js';
import { AchievementTypeEntity } from '../entities/achievement-type.entity.js';

export interface AchievementTypeQueryInput extends PaginationQueryInput {
  search?: string;
  isActive?: boolean;
}

export abstract class IAchievementTypeRepository {
  abstract findAll(
    query: AchievementTypeQueryInput,
  ): Promise<PaginatedResult<AchievementTypeEntity>>;

  abstract findById(id: string): Promise<AchievementTypeEntity | null>;
  abstract findByName(
    name: string,
    excludeId?: string,
  ): Promise<AchievementTypeEntity | null>;

  abstract create(data: {
    name: string;
    isActive?: boolean;
  }): Promise<AchievementTypeEntity>;
  abstract update(
    id: string,
    data: { name?: string; isActive?: boolean },
  ): Promise<AchievementTypeEntity>;

  abstract softDelete(id: string): Promise<AchievementTypeEntity>;
}
