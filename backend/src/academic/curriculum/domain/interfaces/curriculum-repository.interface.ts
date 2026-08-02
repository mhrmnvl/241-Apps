import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../../shared/domain/interfaces/repository.interface.js';
import { CurriculumEntity } from '../entities/curriculum.entity.js';
import { CurriculumWithDetails } from '../entities/curriculum.entity.js';

export type { CurriculumWithDetails };

export interface CurriculumQueryInput extends PaginationQueryInput {
  search?: string;
  academicYearId?: string;
  isActive?: boolean;
}

export interface CreateCurriculumRepositoryInput {
  academicYearId: string;
  name: string;
  isActive?: boolean;
}

export type UpdateCurriculumRepositoryInput =
  Partial<CreateCurriculumRepositoryInput>;

export abstract class ICurriculumRepository {
  abstract findAll(
    query: CurriculumQueryInput,
  ): Promise<PaginatedResult<CurriculumWithDetails>>;
  abstract findById(id: string): Promise<CurriculumWithDetails | null>;
  abstract findByName(
    name: string,
    excludeId?: string,
  ): Promise<CurriculumEntity | null>;
  abstract findByNameAndAcademicYear(
    name: string,
    academicYearId: string,
    excludeId?: string,
  ): Promise<CurriculumEntity | null>;
  abstract create(
    input: CreateCurriculumRepositoryInput,
  ): Promise<CurriculumWithDetails>;
  abstract update(
    id: string,
    input: UpdateCurriculumRepositoryInput,
  ): Promise<CurriculumWithDetails>;
  abstract remove(id: string): Promise<CurriculumEntity>;
  abstract softDelete(id: string): Promise<CurriculumEntity>;
  abstract countGradeAssignments(id: string): Promise<number>;
}
