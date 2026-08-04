import { Day, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import type { ScheduleQueryInput } from '../../domain/interfaces/schedule-repository.interface.js';
import {
  SCHEDULE_WITH_DETAILS_INCLUDE,
  ScheduleWithDetails,
} from './prisma-schedule.includes.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

/** Only live academic years are in scope for every schedule read. */
export const LIVE_ACADEMIC_YEAR = {
  classroom: { academicYear: { deletedAt: null } },
};

const BY_TIME = [
  { day: 'asc' as const },
  { timeSlot: { order: 'asc' as const } },
];

export async function findSchedulePage(
  prisma: PrismaService,
  query: ScheduleQueryInput,
): Promise<PaginatedResult<ScheduleWithDetails>> {
  const { page = 1, limit = 10, teachingAssignmentId, day, timeSlotId } = query;

  const where: Prisma.ScheduleWhereInput = {
    deletedAt: null,
    teachingAssignment: LIVE_ACADEMIC_YEAR,
    ...(teachingAssignmentId ? { teachingAssignmentId } : {}),
    ...(day ? { day } : {}),
    ...(timeSlotId ? { timeSlotId } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.schedule.findMany({
      where,
      include: SCHEDULE_WITH_DETAILS_INCLUDE,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: BY_TIME,
    }),
    prisma.schedule.count({ where }),
  ]);

  return { data, total, page, limit };
}

export async function findScheduleById(
  prisma: PrismaService,
  id: string,
): Promise<ScheduleWithDetails | null> {
  return prisma.schedule.findFirst({
    where: { id, deletedAt: null, teachingAssignment: LIVE_ACADEMIC_YEAR },
    include: SCHEDULE_WITH_DETAILS_INCLUDE,
  });
}

/** The whole week for one classroom — backs the schedule editor. */
export async function findScheduleByClassroom(
  prisma: PrismaService,
  classroomId: string,
): Promise<ScheduleWithDetails[]> {
  return prisma.schedule.findMany({
    where: {
      deletedAt: null,
      teachingAssignment: {
        classroomId,
        deletedAt: null,
        ...LIVE_ACADEMIC_YEAR,
      },
    },
    include: SCHEDULE_WITH_DETAILS_INCLUDE,
    orderBy: BY_TIME,
  });
}

/**
 * Clears one classroom's lessons for a single day. The schedule editor saves a
 * whole day at a time, so it wipes then rewrites rather than diffing rows.
 */
export async function softDeleteClassroomDay(
  prisma: PrismaService,
  classroomId: string,
  day: Day,
): Promise<Prisma.BatchPayload> {
  return prisma.schedule.updateMany({
    where: {
      deletedAt: null,
      day,
      teachingAssignment: {
        classroomId,
        deletedAt: null,
        ...LIVE_ACADEMIC_YEAR,
      },
    },
    data: { deletedAt: new Date() },
  });
}
