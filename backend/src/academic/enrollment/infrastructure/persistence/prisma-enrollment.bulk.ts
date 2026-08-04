import { EnrollmentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';

/**
 * Set-based writes used by bulk enrolment, semester rollover, and class
 * promotion. All three use `skipDuplicates` so a re-run is a no-op rather than
 * a unique-constraint failure.
 */

export interface BulkEnrollmentRow {
  studentId: string;
  classroomId: string;
  semesterId: string;
  status?: EnrollmentStatus;
}

export async function createManyEnrollments(
  prisma: PrismaService,
  rows: BulkEnrollmentRow[],
): Promise<Prisma.BatchPayload> {
  return prisma.studentEnrollment.createMany({
    data: rows.map((item) => ({ ...item, status: item.status ?? undefined })),
    skipDuplicates: true,
  });
}

/** Rollover always lands students as ACTIVE in the target semester. */
export async function createManyForRollover(
  prisma: PrismaService,
  rows: Omit<BulkEnrollmentRow, 'status'>[],
): Promise<Prisma.BatchPayload> {
  return prisma.studentEnrollment.createMany({
    data: rows.map((item) => ({ ...item, status: EnrollmentStatus.ACTIVE })),
    skipDuplicates: true,
  });
}

export async function updateManyStatus(
  prisma: PrismaService,
  ids: string[],
  status: EnrollmentStatus,
  endedAt?: Date,
): Promise<Prisma.BatchPayload> {
  return prisma.studentEnrollment.updateMany({
    where: { id: { in: ids } },
    data: { status, ...(endedAt && { endedAt }) },
  });
}
