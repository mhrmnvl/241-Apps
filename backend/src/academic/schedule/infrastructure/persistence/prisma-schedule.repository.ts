import { Injectable } from '@nestjs/common';
import { Day, Prisma, Schedule } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import type {
  ScheduleQueryInput,
  CreateScheduleRepositoryInput,
  UpdateScheduleRepositoryInput,
} from '../../domain/interfaces/schedule-repository.interface.js';
import { IScheduleRepository } from '../../domain/interfaces/schedule-repository.interface.js';
import {
  SCHEDULE_WITH_DETAILS_INCLUDE,
  ScheduleWithDetails,
} from './prisma-schedule.includes.js';
import {
  findSchedulePage,
  findScheduleById,
  findScheduleByClassroom,
  softDeleteClassroomDay,
} from './prisma-schedule.queries.js';
import {
  findAssignmentConflict,
  findClassroomConflict,
  findDuplicateRow,
  findSoftDeletedRow,
  findTeacherConflict,
} from './prisma-schedule.conflicts.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

/**
 * Prisma adapter for `IScheduleRepository`.
 *
 * Reads live in `.queries`, slot-collision checks in `.conflicts`. Writes stay
 * here — they are single statements with nothing to extract. Anything reaching
 * outside the Schedule aggregate belongs to `IScheduleLookupRepository`.
 */
@Injectable()
export class PrismaScheduleRepository extends IScheduleRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  // ── reads ────────────────────────────────────────────────────────────

  async findAll(
    query: ScheduleQueryInput,
  ): Promise<PaginatedResult<ScheduleWithDetails>> {
    return findSchedulePage(this.prisma, query);
  }

  async findById(id: string): Promise<ScheduleWithDetails | null> {
    return findScheduleById(this.prisma, id);
  }

  async findByClassroom(classroomId: string): Promise<ScheduleWithDetails[]> {
    return findScheduleByClassroom(this.prisma, classroomId);
  }

  // ── collision checks ─────────────────────────────────────────────────

  async findConflictingSchedule(
    teachingAssignmentId: string,
    timeSlotId: string,
    day: Day,
    excludeId?: string,
  ): Promise<ScheduleWithDetails | null> {
    return findAssignmentConflict(
      this.prisma,
      teachingAssignmentId,
      timeSlotId,
      day,
      excludeId,
    );
  }

  async findTeacherConflictingSchedule(
    teacherId: string,
    semesterId: string,
    timeSlotId: string,
    day: Day,
    excludeId?: string,
  ): Promise<ScheduleWithDetails | null> {
    return findTeacherConflict(
      this.prisma,
      teacherId,
      semesterId,
      timeSlotId,
      day,
      excludeId,
    );
  }

  async findClassroomConflictingSchedule(
    classroomId: string,
    semesterId: string,
    timeSlotId: string,
    day: Day,
    excludeId?: string,
  ): Promise<ScheduleWithDetails | null> {
    return findClassroomConflict(
      this.prisma,
      classroomId,
      semesterId,
      timeSlotId,
      day,
      excludeId,
    );
  }

  async findDuplicate(
    teachingAssignmentId: string,
    day: Day,
    timeSlotId: string,
    excludeId?: string,
  ): Promise<Schedule | null> {
    return findDuplicateRow(
      this.prisma,
      teachingAssignmentId,
      day,
      timeSlotId,
      excludeId,
    );
  }

  async findSoftDeleted(
    teachingAssignmentId: string,
    day: Day,
    timeSlotId: string,
  ): Promise<Schedule | null> {
    return findSoftDeletedRow(
      this.prisma,
      teachingAssignmentId,
      day,
      timeSlotId,
    );
  }

  // ── writes ───────────────────────────────────────────────────────────

  async create(
    data: CreateScheduleRepositoryInput,
  ): Promise<ScheduleWithDetails> {
    return this.prisma.schedule.create({
      data: {
        teachingAssignmentId: data.teachingAssignmentId,
        timeSlotId: data.timeSlotId,
        day: data.day as Day,
        room: data.room,
      },
      include: SCHEDULE_WITH_DETAILS_INCLUDE,
    });
  }

  async update(
    id: string,
    data: UpdateScheduleRepositoryInput,
  ): Promise<ScheduleWithDetails> {
    return this.prisma.schedule.update({
      where: { id },
      data: toPrismaScheduleData(data),
      include: SCHEDULE_WITH_DETAILS_INCLUDE,
    });
  }

  async restore(
    id: string,
    data?: UpdateScheduleRepositoryInput,
  ): Promise<ScheduleWithDetails> {
    return this.prisma.schedule.update({
      where: { id },
      data: { ...toPrismaScheduleData(data ?? {}), deletedAt: null },
      include: SCHEDULE_WITH_DETAILS_INCLUDE,
    });
  }

  async softDelete(id: string): Promise<Schedule> {
    return this.prisma.schedule.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async remove(id: string): Promise<Schedule> {
    return this.softDelete(id);
  }

  async softDeleteByClassroomAndDay(
    classroomId: string,
    day: Day,
  ): Promise<Prisma.BatchPayload> {
    return softDeleteClassroomDay(this.prisma, classroomId, day);
  }
}

/** Domain contract accepts `DayEnum | string`; Prisma wants its own `Day`. */
function toPrismaScheduleData(
  data: UpdateScheduleRepositoryInput,
): Prisma.ScheduleUncheckedUpdateInput {
  const { day, ...rest } = data;
  return { ...rest, ...(day !== undefined && { day: day as Day }) };
}
