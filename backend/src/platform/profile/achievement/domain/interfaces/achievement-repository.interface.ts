import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../../../shared/domain/interfaces/repository.interface.js';
import { AchievementEntity } from '../entities/achievement.entity.js';

export interface AchievementQueryInput extends PaginationQueryInput {
  profileId?: string;
  typeId?: string;
  year?: number;
}

export interface CreateAchievementRepositoryInput {
  profileId: string;
  name: string;
  level: string;
  typeId: string;
  year: number;
  description?: string;
}

export type UpdateAchievementRepositoryInput =
  Partial<CreateAchievementRepositoryInput>;

export abstract class IAchievementRepository {
  abstract findAll(
    query: AchievementQueryInput,
  ): Promise<PaginatedResult<AchievementEntity>>;
  abstract findById(id: string): Promise<AchievementEntity | null>;
  abstract create(
    input: CreateAchievementRepositoryInput,
  ): Promise<AchievementEntity>;
  abstract update(
    id: string,
    input: UpdateAchievementRepositoryInput,
  ): Promise<AchievementEntity>;
  abstract softDelete(id: string): Promise<AchievementEntity>;
}
