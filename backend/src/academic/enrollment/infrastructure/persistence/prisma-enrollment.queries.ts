import { EnrollmentStatus, Prisma, StudentEnrollment } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import type { StudentEnrollmentQueryInput } from '../../domain/interfaces/enrollment-repository.interface.js';
import {
  ENROLLMENT_WITH_DETAILS_INCLUDE,
  EnrollmentWithDetails,
} from './prisma-enrollment.includes.js';

/** Every "is this student currently enrolled?" read shares this predicate. */
const ACTIVE = { status: EnrollmentStatus.ACTIVE, deletedAt: null };

/**
 * Where-clause for the paginated enrolment list. A semester and an academic
 * year are alternative scopes — the caller supplies one, and the repository
 * falls back to the active semester when neither is given.
 */
export function buildEnrollmentListWhere(
  query: StudentEnrollmentQueryInput,
  resolvedSemesterId?: string | null,
): Prisma.StudentEnrollmentWhereInput {
  const { studentId, classroomId, academicYearId, status } = query;

  return {
    deletedAt: null,
    ...(studentId && { studentId }),
    ...(classroomId && { classroomId }),
    ...(resolvedSemesterId && { semesterId: resolvedSemesterId }),
    ...(status && { status }),
    ...(academicYearId && { semester: { academicYearId } }),
  };
}

export async function findActiveByStudent(
  prisma: PrismaService,
  studentId: string,
): Promise<EnrollmentWithDetails | null> {
  return prisma.studentEnrollment.findFirst({
    where: { studentId, ...ACTIVE },
    include: ENROLLMENT_WITH_DETAILS_INCLUDE,
  });
}

export async function findActiveByClassroomSemester(
  prisma: PrismaService,
  classroomId: string,
  semesterId: string,
): Promise<EnrollmentWithDetails[]> {
  return prisma.studentEnrollment.findMany({
    where: { classroomId, semesterId, ...ACTIVE },
    include: ENROLLMENT_WITH_DETAILS_INCLUDE,
  });
}

export async function countActiveByClassroomSemester(
  prisma: PrismaService,
  classroomId: string,
  semesterId: string,
): Promise<number> {
  return prisma.studentEnrollment.count({
    where: { classroomId, semesterId, ...ACTIVE },
  });
}

export async function countActiveByIds(
  prisma: PrismaService,
  ids: string[],
): Promise<number> {
  return prisma.studentEnrollment.count({
    where: { id: { in: ids }, ...ACTIVE },
  });
}

export async function findManyActiveByIds(
  prisma: PrismaService,
  ids: string[],
): Promise<EnrollmentWithDetails[]> {
  return prisma.studentEnrollment.findMany({
    where: { id: { in: ids }, ...ACTIVE },
    include: ENROLLMENT_WITH_DETAILS_INCLUDE,
  });
}

export async function findActiveEnrollment(
  prisma: PrismaService,
  studentId: string,
  semesterId?: string,
  excludeId?: string,
): Promise<EnrollmentWithDetails | null> {
  return prisma.studentEnrollment.findFirst({
    where: {
      studentId,
      ...(semesterId && { semesterId }),
      ...ACTIVE,
      ...(excludeId && { NOT: { id: excludeId } }),
    },
    include: ENROLLMENT_WITH_DETAILS_INCLUDE,
  });
}

/** Any live enrolment for the student in that semester, active or not. */
export async function findDuplicateEnrollment(
  prisma: PrismaService,
  studentId: string,
  semesterId?: string,
  excludeId?: string,
): Promise<StudentEnrollment | null> {
  return prisma.studentEnrollment.findFirst({
    where: {
      studentId,
      ...(semesterId && { semesterId }),
      deletedAt: null,
      ...(excludeId && { NOT: { id: excludeId } }),
    },
  });
}

/** Soft-deleted twin, restored instead of re-inserted (partial unique index). */
export async function findSoftDeletedEnrollment(
  prisma: PrismaService,
  studentId: string,
  semesterId: string,
): Promise<StudentEnrollment | null> {
  return prisma.studentEnrollment.findFirst({
    where: { studentId, semesterId, deletedAt: { not: null } },
  });
}
