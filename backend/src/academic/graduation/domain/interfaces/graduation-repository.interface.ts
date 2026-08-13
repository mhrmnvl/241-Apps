import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../../shared/domain/interfaces/repository.interface.js';
import {
  StudentGraduationEntity,
  GraduationWithDetails,
  GraduationWithDetails as StudentGraduationWithDetails,
} from '../entities/graduation.entity.js';

export type { GraduationWithDetails, StudentGraduationWithDetails };

export interface StudentGraduationQueryInput extends PaginationQueryInput {
  academicYearId?: string;
  search?: string;
}

export interface CreateStudentGraduationRepositoryInput {
  studentId: string;
  academicYearId: string;
  graduationDate?: Date;
  certificateNo?: string;
  note?: string;
}

export type UpdateStudentGraduationRepositoryInput =
  Partial<CreateStudentGraduationRepositoryInput>;

/**
 * A student who may be graduated: in the final grade of the chosen semester,
 * still actively enrolled, and without a graduation record already.
 */
export interface GraduationCandidate {
  studentId: string;
  studentName: string;
  nis: string;
  classroomId: string;
  classroomName: string;
  gradeName: string;
}

export interface BulkGraduationStudentInput {
  studentId: string;
  certificateNo?: string;
  note?: string;
}

export interface BulkGraduationInput {
  /** Derived from the active semester, never supplied by the caller. */
  academicYearId: string;
  graduationDate?: Date;
  students: BulkGraduationStudentInput[];
}

/**
 * The candidate list and the term it was taken from.
 *
 * The year is reported, not asked for. A school has one active academic year,
 * and requiring someone to name it is asking them to restate what the system
 * already knows — with a chance of naming the wrong one, which here means
 * graduating the wrong cohort.
 */
export interface GraduationCandidateList {
  /** The active year the list was taken from — reported, never asked for. */
  academicYear: { id: string; name: string } | null;
  /** Which grade counts as final this year, e.g. "IX". Null when no classes. */
  finalGradeName: string | null;
  students: GraduationCandidate[];
}

/**
 * `skipped` counts students who already had a graduation record. A re-run after
 * a partial failure must not fail on them, and must not graduate them twice.
 */
export interface BulkGraduationResult {
  graduated: number;
  skipped: number;
}

export abstract class IGraduationRepository {
  abstract findAll(
    query: StudentGraduationQueryInput,
  ): Promise<PaginatedResult<GraduationWithDetails>>;
  abstract findById(id: string): Promise<GraduationWithDetails | null>;
  abstract findByStudentId(
    studentId: string,
  ): Promise<StudentGraduationEntity | null>;
  abstract create(
    input: CreateStudentGraduationRepositoryInput,
  ): Promise<GraduationWithDetails>;
  abstract update(
    id: string,
    input: UpdateStudentGraduationRepositoryInput,
  ): Promise<GraduationWithDetails>;
  abstract remove(id: string): Promise<StudentGraduationEntity>;
  abstract softDelete(id: string): Promise<StudentGraduationEntity>;
  abstract findCandidates(): Promise<GraduationCandidateList>;
  abstract findActiveAcademicYearId(): Promise<string | null>;
  abstract executeBulk(
    input: BulkGraduationInput,
  ): Promise<BulkGraduationResult>;
}
