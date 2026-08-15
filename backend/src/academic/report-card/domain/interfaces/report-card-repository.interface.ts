import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../../shared/domain/interfaces/repository.interface.js';
import {
  ReportCardEntity,
  ReportCardWithDetails,
} from '../entities/report-card.entity.js';

export type { ReportCardWithDetails };

export interface ReportCardQueryInput extends PaginationQueryInput {
  studentId?: string;
  classroomId?: string;
  semesterId?: string;
  isPublished?: boolean;
}

/**
 * What the summary cards above the list state, for the whole filtered set.
 *
 * `averageScore` is the average across report cards that have one; cards still
 * awaiting generation carry no `totalAverage` and are left out rather than
 * counted as zero, which would drag a class average down for no reason. It is
 * null when nothing in the set has a score yet, so the screen can say "-"
 * instead of "0".
 */
export interface ReportCardSummary {
  published: number;
  draft: number;
  averageScore: number | null;
}

/** One subject's frozen line, as generation resolved it. */
export interface ReportCardSubjectInput {
  subjectId: string;
  subjectCode?: string | null;
  subjectName: string;
  score: number;
  passingScore: number;
  predicate: string;
  description: string;
  isComplete: boolean;
}

export interface CreateReportCardRepositoryInput {
  enrollmentId: string;
  totalAverage?: number | null;
  rank?: number | null;
  teacherNote?: string | null;
  isPublished?: boolean;
  /** Replaces the stored lines wholesale when present. */
  subjects?: ReportCardSubjectInput[];
}

export interface UpdateReportCardRepositoryInput {
  totalAverage?: number | null;
  rank?: number | null;
  teacherNote?: string | null;
  isPublished?: boolean;
}

export abstract class IReportCardRepository {
  abstract findAll(
    query: ReportCardQueryInput,
  ): Promise<PaginatedResult<ReportCardWithDetails, ReportCardSummary>>;
  abstract findById(id: string): Promise<ReportCardWithDetails | null>;
  /**
   * Which enrolment, and therefore which student, a card belongs to.
   *
   * A projection of its own rather than a read of the whole card:
   * `ReportCardWithDetails` types every field optional, so the enrolment it
   * carries can be narrowed away without anything failing to compile — and
   * whose card this is decides whether a student may open it.
   */
  abstract findOwnership(
    id: string,
  ): Promise<{ enrollmentId: string; studentId: string } | null>;
  abstract findByEnrollmentId(
    enrollmentId: string,
  ): Promise<ReportCardWithDetails | null>;
  abstract create(
    input: CreateReportCardRepositoryInput,
  ): Promise<ReportCardWithDetails>;
  abstract update(
    id: string,
    input: UpdateReportCardRepositoryInput,
  ): Promise<ReportCardWithDetails>;
  abstract remove(id: string): Promise<ReportCardEntity>;
  abstract softDelete(id: string): Promise<ReportCardEntity>;
  abstract upsert(
    input: CreateReportCardRepositoryInput,
  ): Promise<ReportCardWithDetails>;
  abstract calculateAndApplyClassroomRanks(
    classroomId: string,
    semesterId: string,
    targetEnrollmentId?: string,
  ): Promise<number | null>;
}
