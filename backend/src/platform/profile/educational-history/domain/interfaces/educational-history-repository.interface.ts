import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../../../shared/domain/interfaces/repository.interface.js';
import { EducationStatus } from '../../../../../shared/domain/enums/education-status.enum.js';
import { EducationalHistoryEntity } from '../entities/educational-history.entity.js';

export interface EducationalHistoryQueryInput extends PaginationQueryInput {
  profileId?: string;
  level?: string;
  status?: EducationStatus;
}

export interface CreateEducationalHistoryRepositoryInput {
  profileId: string;
  level: string;
  institution: string;
  major?: string;
  startYear: number;
  endYear?: number;
  status?: EducationStatus;
}

export type UpdateEducationalHistoryRepositoryInput =
  Partial<CreateEducationalHistoryRepositoryInput>;

export abstract class IEducationalHistoryRepository {
  abstract findAll(
    query: EducationalHistoryQueryInput,
  ): Promise<PaginatedResult<EducationalHistoryEntity>>;
  abstract findById(id: string): Promise<EducationalHistoryEntity | null>;
  abstract create(
    input: CreateEducationalHistoryRepositoryInput,
  ): Promise<EducationalHistoryEntity>;
  abstract update(
    id: string,
    input: UpdateEducationalHistoryRepositoryInput,
  ): Promise<EducationalHistoryEntity>;
  abstract softDelete(id: string): Promise<EducationalHistoryEntity>;
}
