import { PromotionAction } from '../enums/promotion-action.enum.js';
import { SemesterWithAcademicYear } from '../entities/semester.entity.js';
import {
  ClassroomWithGrade,
  ActiveEnrollmentWithDetails,
} from '../entities/promotion.entity.js';

export type {
  SemesterWithAcademicYear,
  ClassroomWithGrade,
  ActiveEnrollmentWithDetails,
};

export interface StudentPromotionInput {
  studentId: string;
  sourceClassroomId: string;
  action: PromotionAction;
  targetClassroomId?: string;
  declineReason?: string;
}

export interface PromotionResult {
  promoted: number;
  repeated: number;
  skipped: number;
}

export abstract class IPromotionRepository {
  abstract findSemesterWithAcademicYear(
    id: string,
  ): Promise<SemesterWithAcademicYear | null>;

  /**
   * The term a promotion reads from and the term it writes into.
   *
   * `edge` is 'last' for the year being left and 'first' for the year being
   * entered. Ordered by `SemesterType.sequence`, never by name: semester types
   * are master data the school edits, and the sequence column exists precisely
   * because ordering by name sorted the English enum alphabetically — EVEN
   * before ODD — and a rename or a third term would scramble it again.
   */
  abstract findEdgeSemesterOfAcademicYear(
    academicYearId: string,
    edge: 'first' | 'last',
  ): Promise<SemesterWithAcademicYear | null>;

  /**
   * The term a promotion reads its roster from: the latest one in the year
   * that anybody is actually enrolled in.
   *
   * Latest, not last. A school planning next year while still in its first
   * term has every student enrolled there — the second term exists on the
   * calendar and is empty until the rollover runs. Reading the last term
   * regardless found nobody and left the screen with no classes to filter by,
   * which is indistinguishable from a screen still waiting for a choice.
   *
   * Ordered by `SemesterType.sequence` like everything else here, so once the
   * rollover has run this returns the second term instead, with no rule to
   * change.
   */
  abstract findLatestEnrolledSemesterOfAcademicYear(
    academicYearId: string,
  ): Promise<SemesterWithAcademicYear | null>;

  abstract findAcademicYearName(id: string): Promise<string | null>;

  abstract findClassroomById(id: string): Promise<ClassroomWithGrade | null>;

  abstract findActiveEnrollmentsWithDetails(
    semesterId: string,
  ): Promise<ActiveEnrollmentWithDetails[]>;

  abstract findClassesByAcademicYear(
    academicYearId: string,
  ): Promise<ClassroomWithGrade[]>;

  abstract executePromotion(
    sourceSemesterId: string,
    targetSemesterId: string,
    students: StudentPromotionInput[],
  ): Promise<PromotionResult>;
}
