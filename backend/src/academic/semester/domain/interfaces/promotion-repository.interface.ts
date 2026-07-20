import { Prisma } from '@prisma/client';
import { PromotionAction } from '../../dto/request/promotion.dto.js';

export const SEMESTER_WITH_ACADEMIC_YEAR_SELECT = {
  id: true,
  type: true,
  academicYearId: true,
  academicYear: { select: { id: true, name: true } },
} satisfies Prisma.SemesterSelect;

export type SemesterWithAcademicYear = Prisma.SemesterGetPayload<{
  select: typeof SEMESTER_WITH_ACADEMIC_YEAR_SELECT;
}>;

export const CLASSROOM_WITH_GRADE_SELECT = {
  id: true,
  code: true,
  name: true,
  gradeId: true,
  grade: { select: { level: true, name: true } },
  academicYearId: true,
} satisfies Prisma.ClassroomSelect;

export type ClassroomWithGrade = Prisma.ClassroomGetPayload<{
  select: typeof CLASSROOM_WITH_GRADE_SELECT;
}>;

export const ACTIVE_ENROLLMENT_WITH_DETAILS_SELECT = {
  id: true,
  studentId: true,
  classroomId: true,
  student: {
    select: {
      id: true,
      nis: true,
      user: {
        select: {
          profile: {
            select: { name: true },
          },
        },
      },
    },
  },
  classroom: {
    select: {
      id: true,
      code: true,
      name: true,
      gradeId: true,
      grade: { select: { level: true, name: true } },
    },
  },
  reportCard: {
    select: { totalAverage: true },
  },
} satisfies Prisma.StudentEnrollmentSelect;

export type ActiveEnrollmentWithDetails = Prisma.StudentEnrollmentGetPayload<{
  select: typeof ACTIVE_ENROLLMENT_WITH_DETAILS_SELECT;
}>;

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
