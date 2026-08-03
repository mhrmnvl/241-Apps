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
  graduated: number;
  skipped: number;
}

export abstract class IPromotionRepository {
  abstract findSemesterWithAcademicYear(
    id: string,
  ): Promise<SemesterWithAcademicYear | null>;

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
