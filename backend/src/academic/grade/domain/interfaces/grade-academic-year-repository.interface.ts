import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../../shared/domain/interfaces/repository.interface.js';
import {
  GradeAcademicYearEntity,
  GradeAcademicYearWithDetails,
} from '../entities/grade-academic-year.entity.js';

export type { GradeAcademicYearWithDetails };

export interface CreateGradeAcademicYearRepositoryInput {
  gradeId: string;
  academicYearId: string;
  curriculumId: string;
}

export type UpdateGradeAcademicYearRepositoryInput =
  Partial<CreateGradeAcademicYearRepositoryInput>;

export abstract class IGradeAcademicYearRepository {
  /** Optionally scoped to a single academic year. */
  abstract findAll(
    academicYearId?: string,
  ): Promise<PaginatedResult<GradeAcademicYearWithDetails>>;
  abstract findById(id: string): Promise<GradeAcademicYearWithDetails | null>;
  abstract findAssignment(
    gradeId: string,
    academicYearId: string,
    excludeId?: string,
  ): Promise<GradeAcademicYearEntity | null>;
  abstract findByGradeAndYear(
    gradeId: string,
    academicYearId: string,
  ): Promise<GradeAcademicYearEntity | null>;
  abstract create(
    input: CreateGradeAcademicYearRepositoryInput,
  ): Promise<GradeAcademicYearWithDetails>;
  abstract update(
    id: string,
    input: UpdateGradeAcademicYearRepositoryInput,
  ): Promise<GradeAcademicYearWithDetails>;
  abstract remove(id: string): Promise<GradeAcademicYearEntity>;
  abstract delete(id: string): Promise<GradeAcademicYearEntity>;
  abstract upsert(
    input: CreateGradeAcademicYearRepositoryInput,
  ): Promise<GradeAcademicYearWithDetails>;
}
