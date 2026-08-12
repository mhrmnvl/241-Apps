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
  passingScore?: number;
}

export type UpdateCurriculumSubjectRepositoryInput =
  Partial<CreateCurriculumSubjectRepositoryInput>;

/** Which curriculum applies: a grade in an academic year picks exactly one. */
export interface PassingScoreQuery {
  gradeId: string;
  academicYearId: string;
  subjectId: string;
}

export interface ResolvedPassingScore extends PassingScoreQuery {
  passingScore: number;
}

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
  /**
   * The passing marks in force for a set of (grade, year, subject) triples.
   *
   * Batched because a report card asks for a dozen at once, and answered from
   * the curriculum rather than the subject: a subject is master data, while
   * the mark is a curriculum decision that differs between curricula.
   *
   * A triple with no curriculum subject row is simply absent from the result;
   * the caller decides what an unlisted subject falls back to.
   */
  abstract findPassingScores(
    queries: PassingScoreQuery[],
  ): Promise<ResolvedPassingScore[]>;

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
