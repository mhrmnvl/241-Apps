import { PrismaService } from '../../../../core/database/prisma.service.js';

/**
 * Reads that leave the Schedule aggregate. `BatchUpsertScheduleUseCase` needs
 * to resolve — and sometimes create — the teaching assignment a lesson row
 * hangs off, so the contract exposes these narrow id-only projections rather
 * than pulling in the whole TeachingAssignment module.
 */

export async function findTeachingAssignmentId(
  prisma: PrismaService,
  id: string,
): Promise<{ id: string } | null> {
  return prisma.teachingAssignment.findFirst({
    where: {
      id,
      classroom: { academicYear: { deletedAt: null } },
      deletedAt: null,
    },
    select: { id: true },
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
): Promise<{ id: string } | null> {
  return prisma.teachingAssignment.findFirst({
    where: { classroomId, subjectId, semesterId, deletedAt: null },
    select: { id: true },
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
): Promise<{ id: string }> {
  return prisma.teachingAssignment.create({ data, select: { id: true } });
}
