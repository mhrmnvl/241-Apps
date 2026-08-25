import { PrismaService } from '../../../../core/database/prisma.service.js';
import type { TeachingAssignmentIdRef } from '../../domain/interfaces/schedule-repository.interface.js';

/**
 * Reads that leave the Schedule aggregate. `BatchUpsertScheduleUseCase` needs
 * to resolve — and sometimes create — the teaching assignment a lesson row
 * hangs off, so the contract exposes these narrow id-only projections rather
 * than pulling in the whole TeachingAssignment module.
 */

/**
 * Not the id alone: placing a lesson has to know whose it is and where, or the
 * clash checks have nothing to compare against.
 */
const ASSIGNMENT_REF_SELECT = {
  id: true,
  teacherId: true,
  classroomId: true,
  semesterId: true,
} as const;

export async function findTeachingAssignmentId(
  prisma: PrismaService,
  id: string,
): Promise<TeachingAssignmentIdRef | null> {
  return prisma.teachingAssignment.findFirst({
    where: {
      id,
      classroom: { academicYear: { deletedAt: null } },
      deletedAt: null,
    },
    select: ASSIGNMENT_REF_SELECT,
  });
}

export async function findValidClassroomId(
  prisma: PrismaService,
  id: string,
): Promise<{ id: string } | null> {
  return prisma.classroom.findFirst({
    where: { id, academicYear: { deletedAt: null }, deletedAt: null },
    select: { id: true },
  });
}

export async function findActiveSemesterId(
  prisma: PrismaService,
): Promise<{ id: string } | null> {
  return prisma.semester.findFirst({
    where: {
      isActive: true,
      deletedAt: null,
      academicYear: { deletedAt: null },
    },
    select: { id: true },
  });
}

export async function findTeachingAssignmentIdBySubject(
  prisma: PrismaService,
  classroomId: string,
  subjectId: string,
  semesterId: string,
): Promise<TeachingAssignmentIdRef | null> {
  return prisma.teachingAssignment.findFirst({
    where: { classroomId, subjectId, semesterId, deletedAt: null },
    select: ASSIGNMENT_REF_SELECT,
  });
}

/** Any teacher already assigned to the subject — used to seed a new assignment. */
export async function findAnyTeacherIdBySubject(
  prisma: PrismaService,
  subjectId: string,
): Promise<string | null> {
  const res = await prisma.teachingAssignment.findFirst({
    where: { subjectId, deletedAt: null },
    select: { teacherId: true },
  });
  return res?.teacherId ?? null;
}

export async function createTeachingAssignmentRow(
  prisma: PrismaService,
  data: {
    classroomId: string;
    subjectId: string;
    teacherId: string;
    semesterId: string;
  },
): Promise<TeachingAssignmentIdRef> {
  return prisma.teachingAssignment.create({
    data,
    select: ASSIGNMENT_REF_SELECT,
  });
}
