import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../../../shared/domain/interfaces/repository.interface.js';
import { ScholarshipStatus } from '../../../../../shared/domain/enums/scholarship-status.enum.js';
import { ScholarshipEntity } from '../entities/scholarship.entity.js';

export interface ScholarshipQueryInput extends PaginationQueryInput {
  profileId?: string;
  status?: ScholarshipStatus;
}

export interface CreateScholarshipRepositoryInput {
  profileId: string;
  name: string;
  provider: string;
  year: number;
  status?: ScholarshipStatus;
}

export type UpdateScholarshipRepositoryInput =
  Partial<CreateScholarshipRepositoryInput>;

export abstract class IScholarshipRepository {
  abstract findAll(
    query: ScholarshipQueryInput,
  ): Promise<PaginatedResult<ScholarshipEntity>>;
  abstract findById(id: string): Promise<ScholarshipEntity | null>;
  abstract create(
    input: CreateScholarshipRepositoryInput,
  ): Promise<ScholarshipEntity>;
  abstract update(
    id: string,
    input: UpdateScholarshipRepositoryInput,
  ): Promise<ScholarshipEntity>;
  abstract softDelete(id: string): Promise<ScholarshipEntity>;
}
