import { Day, Schedule } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import {
  SCHEDULE_WITH_DETAILS_INCLUDE,
  ScheduleWithDetails,
} from './prisma-schedule.includes.js';

/**
 * "Is this slot already taken?" queries. All four look at the same
 * (day, timeSlot) coordinate and differ only in what else must match —
 * the same assignment, the same teacher, or the same classroom.
 */

const notExcluded = (excludeId?: string) =>
  excludeId ? { NOT: { id: excludeId } } : {};

/** Same assignment already placed on this day + slot. */
export async function findAssignmentConflict(
  prisma: PrismaService,
  teachingAssignmentId: string,
  timeSlotId: string,
  day: Day,
  excludeId?: string,
): Promise<ScheduleWithDetails | null> {
  return prisma.schedule.findFirst({
    where: {
      teachingAssignmentId,
      day,
      timeSlotId,
      deletedAt: null,
      ...notExcluded(excludeId),
    },
    include: SCHEDULE_WITH_DETAILS_INCLUDE,
  });
}

/** Teacher already teaching something else on this day + slot. */
export async function findTeacherConflict(
  prisma: PrismaService,
  teacherId: string,
  semesterId: string,
  timeSlotId: string,
  day: Day,
  excludeId?: string,
): Promise<ScheduleWithDetails | null> {
  return prisma.schedule.findFirst({
    where: {
      day,
      timeSlotId,
      deletedAt: null,
      teachingAssignment: { teacherId, semesterId, deletedAt: null },
      ...notExcluded(excludeId),
    },
    include: SCHEDULE_WITH_DETAILS_INCLUDE,
  });
}

/** Classroom already occupied on this day + slot. */
export async function findClassroomConflict(
  prisma: PrismaService,
  classroomId: string,
  semesterId: string,
  timeSlotId: string,
  day: Day,
  excludeId?: string,
): Promise<ScheduleWithDetails | null> {
  return prisma.schedule.findFirst({
    where: {
      day,
      timeSlotId,
      deletedAt: null,
      teachingAssignment: { classroomId, semesterId, deletedAt: null },
      ...notExcluded(excludeId),
    },
    include: SCHEDULE_WITH_DETAILS_INCLUDE,
  });
}

/** Live duplicate, without the detail include. */
export async function findDuplicateRow(
  prisma: PrismaService,
  teachingAssignmentId: string,
  day: Day,
  timeSlotId: string,
  excludeId?: string,
): Promise<Schedule | null> {
  return prisma.schedule.findFirst({
    where: {
      teachingAssignmentId,
      day,
      timeSlotId,
      deletedAt: null,
      ...notExcluded(excludeId),
    },
  });
}

/**
 * Soft-deleted twin of the row about to be created — restoring it keeps the
 * partial unique index happy instead of inserting a duplicate.
 */
export async function findSoftDeletedRow(
  prisma: PrismaService,
  teachingAssignmentId: string,
  day: Day,
  timeSlotId: string,
): Promise<Schedule | null> {
  return prisma.schedule.findFirst({
    where: {
      teachingAssignmentId,
      day,
      timeSlotId,
      deletedAt: { not: null },
    },
  });
}
