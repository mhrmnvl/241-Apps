import { AssessmentType } from '@prisma/client';
import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../../shared/domain/interfaces/repository.interface.js';
import { StudentScoreEntity } from '../entities/student-score.entity.js';
import {
  StudentScoreWithDetails,
  StudentScoreWithDetails as StudentScoreWithReportCardDetails,
} from '../entities/student-score.entity.js';

/**
 * Score row joined all the way out to the subject, which is what the report
 * card and its PDF export read.
 */
export interface ReportCardScoreRow {
  id: string;
  enrollmentId: string;
  assessmentItemId: string;
  score: number | null;
  note?: string | null;
  assessmentItem: {
    id: string;
    name: string;
    type: AssessmentType;
    /** Weight within its type; see AssessmentWeight for the outer layer. */
    weight?: number | null;
    maxScore?: number | null;
    teachingAssignment: {
      id: string;
      /** Overrides the curriculum's passing score for this class only. */
      passingScore?: number | null;
      subject: {
        id: string;
        name: string;
        code?: string | null;
      };
      /**
       * The grade and year the class sits in — together they pick the
       * curriculum, and the curriculum is what sets the passing score.
       */
      classroom: {
        gradeId: string;
        academicYearId: string;
      };
      assessmentWeights: { type: AssessmentType; weight: number }[];
    };
  };
}

/** One student's slot in the score-entry roster for an assessment item. */
export interface StudentScoreRosterItem {
  enrollmentId: string;
  studentName: string;
  nis: string;
  scoreId: string | null;
  score: number | null;
  note: string | null;
}

export interface StudentScoreQueryInput extends PaginationQueryInput {
  assessmentItemId?: string;
  enrollmentId?: string;
  classroomId?: string;
  semesterId?: string;
  /**
   * Every score belonging to one student, across their enrolments.
   *
   * A score hangs off an enrolment, and a student has one per semester, so
   * `enrollmentId` can only ever answer for a single term. Self-service needs
   * the person: "my marks", whichever enrolment they were recorded against.
   */
  studentId?: string;
}

export interface CreateStudentScoreRepositoryInput {
  enrollmentId: string;
  assessmentItemId: string;
  score?: number | null;
  note?: string | null;
}

export interface UpdateStudentScoreRepositoryInput {
  score?: number | null;
  note?: string | null;
}

/** One row of a bulk score-entry submission. */
export interface BulkStudentScoreRecord {
  enrollmentId: string;
  score?: number | null;
  note?: string | null;
}

export interface BulkUpsertResult {
  saved: number;
}

export type { StudentScoreWithDetails, StudentScoreWithReportCardDetails };

export abstract class IStudentScoreRepository {
  abstract findAll(
    query: StudentScoreQueryInput,
  ): Promise<PaginatedResult<StudentScoreWithDetails>>;
  abstract findById(id: string): Promise<StudentScoreWithDetails | null>;
  abstract findScore(
    assessmentItemId: string,
    studentEnrollmentId: string,
    excludeId?: string,
  ): Promise<StudentScoreEntity | null>;
  abstract create(
    input: CreateStudentScoreRepositoryInput,
  ): Promise<StudentScoreWithDetails>;
  abstract update(
    id: string,
    input: UpdateStudentScoreRepositoryInput,
  ): Promise<StudentScoreWithDetails>;
  abstract remove(id: string): Promise<StudentScoreEntity>;
  abstract softDelete(id: string): Promise<StudentScoreEntity>;
  abstract restore(
    id: string,
    input?: UpdateStudentScoreRepositoryInput,
  ): Promise<StudentScoreEntity>;
  abstract findDuplicate(
    enrollmentId: string,
    assessmentItemId: string,
    excludeId?: string,
  ): Promise<StudentScoreEntity | null>;
  abstract findSoftDeleted(
    enrollmentId: string,
    assessmentItemId: string,
  ): Promise<StudentScoreEntity | null>;
  abstract bulkUpsert(
    assessmentItemId: string,
    records: BulkStudentScoreRecord[],
  ): Promise<BulkUpsertResult>;
  abstract getRoster(
    assessmentItemId: string,
    classroomId?: string,
    semesterId?: string,
  ): Promise<StudentScoreRosterItem[]>;
  abstract findAllForReportCard(
    enrollmentId: string,
  ): Promise<ReportCardScoreRow[]>;
}
