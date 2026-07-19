import {
  Classroom,
  ClassroomSupervisor,
  Schedule,
  StudentEnrollment,
  TeachingAssignment,
  Prisma,
} from '@prisma/client';

export const SEMESTER_WITH_ACADEMIC_YEAR_INCLUDE = {
  academicYear: true,
} satisfies Prisma.SemesterInclude;

export type SemesterWithAcademicYear = Prisma.SemesterGetPayload<{
  include: typeof SEMESTER_WITH_ACADEMIC_YEAR_INCLUDE;
}>;

export type TeachingAssignmentWithSchedules = TeachingAssignment & {
  schedules: Schedule[];
};

export interface RolloverSourceData {
  classrooms: Classroom[];
  enrollments: StudentEnrollment[];
  supervisors: ClassroomSupervisor[];
  assignments: TeachingAssignmentWithSchedules[];
}

export interface RolloverResult {
  classrooms: { created: number; skipped: number };
  enrollments: { created: number; skipped: number };
  supervisors: { created: number; skipped: number };
  teachingAssignments: { created: number; skipped: number };
  schedules: { created: number; skipped: number };
}

export abstract class IRolloverRepository {
  abstract findSemesterWithAcademicYear(
    id: string,
  ): Promise<SemesterWithAcademicYear | null>;

  abstract fetchSourceData(
    sourceSemesterId: string,
    sourceAcademicYearId: string,
  ): Promise<RolloverSourceData>;

  abstract executeRollover(
    sourceData: RolloverSourceData,
    targetSemesterId: string,
    targetAcademicYearId: string,
  ): Promise<RolloverResult>;
}
