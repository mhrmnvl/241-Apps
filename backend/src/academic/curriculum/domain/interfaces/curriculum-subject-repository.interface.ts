import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../../shared/domain/interfaces/repository.interface.js';
import {
  CurriculumSubjectEntity,
  CurriculumSubjectWithDetails,
} from '../entities/curriculum-subject.entity.js';

export type { CurriculumSubjectWithDetails };

export interface CurriculumSubjectQueryInput extends PaginationQueryInput {
  curriculumId?: string;
  subjectId?: string;
}

export interface CreateCurriculumSubjectRepositoryInput {
  curriculumId: string;
  subjectId: string;
  gradeId?: string | null;
  hoursPerWeek?: number;
}

export type UpdateCurriculumSubjectRepositoryInput =
  Partial<CreateCurriculumSubjectRepositoryInput>;

export abstract class ICurriculumSubjectRepository {
  abstract findAll(
    query: CurriculumSubjectQueryInput,
  ): Promise<PaginatedResult<CurriculumSubjectWithDetails>>;
  abstract findById(id: string): Promise<CurriculumSubjectWithDetails | null>;
  abstract findAssignment(
    curriculaId: string,
    subjectId: string,
    gradeId?: string,
    excludeId?: string,
  ): Promise<CurriculumSubjectWithDetails | null>;
  abstract create(
    input: CreateCurriculumSubjectRepositoryInput,
  ): Promise<CurriculumSubjectWithDetails>;
  abstract update(
    id: string,
    input: UpdateCurriculumSubjectRepositoryInput,
  ): Promise<CurriculumSubjectWithDetails>;
  abstract remove(id: string): Promise<CurriculumSubjectEntity>;
  abstract softDelete(id: string): Promise<CurriculumSubjectEntity>;
  abstract restore(
    id: string,
    input?: UpdateCurriculumSubjectRepositoryInput,
  ): Promise<CurriculumSubjectWithDetails>;
  abstract findDuplicate(
    curriculaId: string,
    subjectId: string,
    gradeId?: string,
    excludeId?: string,
  ): Promise<CurriculumSubjectWithDetails | null>;
  abstract findSoftDeleted(
    curriculaId: string,
    subjectId: string,
    gradeId?: string,
  ): Promise<CurriculumSubjectWithDetails | null>;
}
