import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../../shared/domain/interfaces/repository.interface.js';
import { AcademicYearEntity } from '../entities/academic-year.entity.js';
import { AcademicYearWithDetails } from '../entities/academic-year.entity.js';

export type { AcademicYearWithDetails };

export interface AcademicYearQueryInput extends PaginationQueryInput {
  search?: string;
}

export interface CreateAcademicYearRepositoryInput {
  name: string;
  startYear: number;
  isActive?: boolean;
}

export type UpdateAcademicYearRepositoryInput =
  Partial<CreateAcademicYearRepositoryInput>;

/** Row count returned by bulk activation/deactivation writes. */
export interface AffectedCount {
  count: number;
}

export abstract class IAcademicYearRepository {
  abstract findAll(
    query: AcademicYearQueryInput,
  ): Promise<PaginatedResult<AcademicYearWithDetails>>;
  abstract findById(id: string): Promise<AcademicYearWithDetails | null>;
  abstract findActive(): Promise<AcademicYearWithDetails | null>;
  abstract findByName(
    name: string,
    excludeId?: string,
  ): Promise<AcademicYearEntity | null>;
  abstract create(
    input: CreateAcademicYearRepositoryInput,
  ): Promise<AcademicYearWithDetails>;
  abstract update(
    id: string,
    input: UpdateAcademicYearRepositoryInput,
  ): Promise<AcademicYearWithDetails>;
  abstract remove(id: string): Promise<AcademicYearEntity>;
  abstract softDelete(id: string): Promise<AcademicYearEntity>;
  abstract deactivateAllActive(excludeId?: string): Promise<AffectedCount>;
  abstract deactivateAll(excludeId?: string): Promise<AffectedCount>;
  abstract activateById(id: string): Promise<AcademicYearEntity>;
  abstract countActive(): Promise<number>;
  abstract deactivateSemestersByAcademicYearId(
    id: string,
  ): Promise<AffectedCount>;
  abstract hasRelatedData(id: string): Promise<boolean>;
}
