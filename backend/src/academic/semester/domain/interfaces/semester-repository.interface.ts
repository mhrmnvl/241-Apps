import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../../shared/domain/interfaces/repository.interface.js';
import { SemesterEntity } from '../entities/semester.entity.js';
import { SemesterWithDetails } from '../entities/semester.entity.js';

export type { SemesterWithDetails };

export interface SemesterTypeRow {
  id: string;
  name: string;
  isActive?: boolean;
}

export interface SemesterQueryInput extends PaginationQueryInput {
  search?: string;
  academicYearId?: string;
  isActive?: boolean;
}

export interface CreateSemesterRepositoryInput {
  academicYearId: string;
  typeId: string;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
}

export interface UpdateSemesterRepositoryInput {
  academicYearId?: string;
  typeId?: string;
  /** `null` clears the date; `undefined` leaves it untouched. */
  startDate?: Date | null;
  endDate?: Date | null;
  isActive?: boolean;
}

export abstract class ISemesterRepository {
  abstract findAll(
    query: SemesterQueryInput,
  ): Promise<PaginatedResult<SemesterWithDetails>>;
  abstract findById(id: string): Promise<SemesterWithDetails | null>;
  abstract findActive(): Promise<SemesterWithDetails | null>;
  abstract findTypeById(id: string): Promise<SemesterTypeRow | null>;
  abstract findByAcademicYearAndType(
    academicYearId: string,
    typeId: string,
    excludeId?: string,
  ): Promise<SemesterEntity | null>;
  abstract create(
    input: CreateSemesterRepositoryInput,
  ): Promise<SemesterWithDetails>;
  abstract update(
    id: string,
    input: UpdateSemesterRepositoryInput,
  ): Promise<SemesterWithDetails>;
  abstract remove(id: string): Promise<SemesterEntity>;
  abstract deactivateAllActive(excludeId?: string): Promise<{ count: number }>;
  abstract activateById(id: string): Promise<SemesterWithDetails>;
  abstract deactivateAll(): Promise<{ count: number }>;
  abstract hasRelatedData(id: string): Promise<boolean>;
  /**
   * What is hanging off this semester, named, or null when nothing is.
   *
   * Named rather than counted so a refusal can say what is in the way. "This
   * semester already has enrolments" sends someone to the right screen;
   * "cannot update" sends them to us.
   */
  abstract findFirstDependent(id: string): Promise<string | null>;
  abstract softDelete(id: string): Promise<SemesterEntity>;
}
