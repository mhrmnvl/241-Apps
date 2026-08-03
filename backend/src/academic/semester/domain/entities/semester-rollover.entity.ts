import { DayEnum } from '../../../../shared/domain/enums/day.enum.js';

/**
 * The academic structure copied from one semester to the next.
 *
 * These are deliberately narrower than the real Classroom / Enrollment /
 * Schedule entities: a rollover only reads the fields it re-creates on the
 * target semester. They live together because they are facets of one concept —
 * the rollover snapshot — not five independent aggregates.
 */

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
