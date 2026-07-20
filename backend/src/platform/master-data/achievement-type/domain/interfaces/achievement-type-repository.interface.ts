import { AchievementType, Prisma } from '@prisma/client';
import { AchievementTypeQueryDto } from '../../dto/request/achievement-type-query.dto.js';
import { PaginatedResult } from '../../../../../shared/domain/interfaces/repository.interface.js';

export abstract class IAchievementTypeRepository {
  abstract findAll(
    query: AchievementTypeQueryDto,
  ): Promise<PaginatedResult<AchievementType>>;

  abstract findById(id: string): Promise<AchievementType | null>;
  abstract findByName(
    name: string,
    excludeId?: string,
  ): Promise<AchievementType | null>;

  abstract create(data: {
    name: string;
    isActive?: boolean;
  }): Promise<AchievementType>;
  abstract update(
    id: string,
    data: Prisma.AchievementTypeUpdateInput,
  ): Promise<AchievementType>;

  abstract softDelete(id: string): Promise<AchievementType>;
}
