import { DayEnum } from '../../../../shared/domain/enums/day.enum.js';
import { SemesterWithAcademicYear } from '../entities/semester.entity.js';

export type { SemesterWithAcademicYear };

export interface ClassroomRolloverEntity {
  id: string;
  gradeId: string;
  code: string;
  name: string | null;
  capacity: number;
  isActive: boolean;
}

export interface StudentEnrollmentRolloverEntity {
  id: string;
  studentId: string;
  classroomId: string;
}

export interface ClassroomSupervisorRolloverEntity {
  id: string;
  classroomId: string;
  teacherId: string;
}

export interface ScheduleRolloverEntity {
  id: string;
  day: `${DayEnum}`;
  timeSlotId: string;
  room?: string | null;
}

export interface TeachingAssignmentRolloverEntity {
  id: string;
  teacherId: string;
  classroomId: string;
  subjectId: string;
  schedules: ScheduleRolloverEntity[];
}

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
