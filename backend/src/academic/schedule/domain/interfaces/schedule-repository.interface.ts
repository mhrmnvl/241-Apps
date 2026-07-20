import { Day, Prisma, Schedule } from '@prisma/client';
import { ScheduleQueryDto } from '../../dto/request/schedule.dto.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

export const SCHEDULE_INCLUDE = {
  teachingAssignment: {
    include: {
      teacher: { include: { user: { select: { profile: true } } } },
      classroom: true,
      subject: true,
    },
  },
  timeSlot: true,
} satisfies Prisma.ScheduleInclude;

export type ScheduleWithDetails = Prisma.ScheduleGetPayload<{
  include: typeof SCHEDULE_INCLUDE;
}>;

export interface CreateScheduleRepositoryInput {
  teachingAssignmentId: string;
  timeSlotId: string;
  day: Day;
  room?: string;
}

export interface RestoreScheduleRepositoryInput {
  room?: string;
}

export abstract class IScheduleRepository {
  abstract findAll(
    query: ScheduleQueryDto,
  ): Promise<PaginatedResult<ScheduleWithDetails>>;
  abstract findById(id: string): Promise<ScheduleWithDetails | null>;
  abstract findDuplicate(
    teachingAssignmentId: string,
    day: Day,
    timeSlotId: string,
    excludeId?: string,
  ): Promise<Schedule | null>;
  abstract create(
    data: CreateScheduleRepositoryInput,
  ): Promise<ScheduleWithDetails>;
  abstract update(
    id: string,
    data: Prisma.ScheduleUpdateInput,
  ): Promise<ScheduleWithDetails>;
  abstract findSoftDeleted(
    teachingAssignmentId: string,
    day: Day,
    timeSlotId: string,
  ): Promise<Schedule | null>;
  abstract restore(
    id: string,
    data: RestoreScheduleRepositoryInput,
  ): Promise<ScheduleWithDetails>;
  abstract softDelete(id: string): Promise<Schedule>;
  abstract findByClassroom(classroomId: string): Promise<ScheduleWithDetails[]>;
  abstract softDeleteByClassroomAndDay(
    classroomId: string,
    day: Day,
  ): Promise<Prisma.BatchPayload>;
}
