import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../../shared/domain/interfaces/repository.interface.js';
import { DayEnum } from '../../../../shared/domain/enums/day.enum.js';
import {
  ScheduleWithDetails,
  ScheduleEntity,
} from '../entities/schedule.entity.js';

export type { ScheduleWithDetails };

export interface ScheduleQueryInput extends PaginationQueryInput {
  teachingAssignmentId?: string;
  timeSlotId?: string;
  day?: DayEnum;
  /**
   * Every lesson one teacher gives, across their assignments. Set from the
   * signed-in account for the self-service read, never from a query field.
   */
  teacherId?: string;
}

export interface CreateScheduleRepositoryInput {
  teachingAssignmentId: string;
  timeSlotId: string;
  day?: DayEnum;
  room?: string;
}

export interface UpdateScheduleRepositoryInput {
  teachingAssignmentId?: string;
  timeSlotId?: string;
  day?: DayEnum | string;
  room?: string | null;
}

export interface CreateTeachingAssignmentFromScheduleInput {
  teacherId: string;
  classroomId: string;
  subjectId: string;
  semesterId: string;
}

/**
 * Identity-only rows: the scheduling flow resolves these purely to obtain (or
 * confirm) an id before writing, so nothing else is selected.
 */
export interface ClassroomIdRef {
  id: string;
}

export interface ActiveSemesterIdRef {
  id: string;
}

/**
 * A teaching assignment, with the three things a lesson clashes over.
 *
 * This was the id alone, which was enough to write a row and not enough to
 * check one: "is this teacher already teaching then" and "is this class
 * already busy then" cannot be asked without knowing who and where. The
 * conflict queries below existed the whole time and nothing called them.
 */
export interface TeachingAssignmentIdRef {
  id: string;
  teacherId: string;
  classroomId: string;
  semesterId: string;
}

export abstract class IScheduleRepository {
  abstract findAll(
    query: ScheduleQueryInput,
  ): Promise<PaginatedResult<ScheduleWithDetails>>;
  abstract findById(id: string): Promise<ScheduleWithDetails | null>;
  abstract findConflictingSchedule(
    teachingAssignmentId: string,
    timeSlotId: string,
    day: DayEnum,
    excludeId?: string,
  ): Promise<ScheduleWithDetails | null>;
  abstract findTeacherConflictingSchedule(
    teacherId: string,
    semesterId: string,
    timeSlotId: string,
    day: DayEnum,
    excludeId?: string,
  ): Promise<ScheduleWithDetails | null>;
  abstract findClassroomConflictingSchedule(
    classroomId: string,
    semesterId: string,
    timeSlotId: string,
    day: DayEnum,
    excludeId?: string,
  ): Promise<ScheduleWithDetails | null>;
  abstract create(
    input: CreateScheduleRepositoryInput,
  ): Promise<ScheduleWithDetails>;
  abstract update(
    id: string,
    input: UpdateScheduleRepositoryInput,
  ): Promise<ScheduleWithDetails>;
  abstract remove(id: string): Promise<ScheduleEntity>;
  abstract softDelete(id: string): Promise<ScheduleEntity>;

  abstract softDeleteByClassroomAndDay(
    classroomId: string,
    day: DayEnum,
  ): Promise<{ count: number }>;
  // Named to match the implementation and every caller, which pass the day
  // second. The contract said `(taId, slotId, day)` and typed the day as a
  // plain string, so the two could be swapped and still compile.
  abstract findSoftDeleted(
    teachingAssignmentId: string,
    day: DayEnum,
    timeSlotId: string,
  ): Promise<ScheduleEntity | null>;
  abstract restore(
    id: string,
    input?: UpdateScheduleRepositoryInput,
  ): Promise<ScheduleWithDetails>;
  abstract findDuplicate(
    taId: string,
    slotId: string,
    day: string,
    excludeId?: string,
  ): Promise<ScheduleEntity | null>;
  abstract findByClassroom(
    classroomId: string,
    semesterId?: string,
  ): Promise<ScheduleWithDetails[]>;
}
