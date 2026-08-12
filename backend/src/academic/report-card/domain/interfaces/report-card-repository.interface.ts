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
  ): Promise<PaginatedResult<ReportCardWithDetails>>;
  abstract findById(id: string): Promise<ReportCardWithDetails | null>;
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
