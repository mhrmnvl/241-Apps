import {
  ClassroomRolloverEntity,
  ClassroomSupervisorRolloverEntity,
  StudentEnrollmentRolloverEntity,
  TeachingAssignmentRolloverEntity,
} from '../entities/semester-rollover.entity.js';
import { SemesterWithAcademicYear } from '../entities/semester.entity.js';

export type { SemesterWithAcademicYear };

export interface RolloverSourceData {
  classrooms: ClassroomRolloverEntity[];
  enrollments: StudentEnrollmentRolloverEntity[];
  supervisors: ClassroomSupervisorRolloverEntity[];
  assignments: TeachingAssignmentRolloverEntity[];
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
