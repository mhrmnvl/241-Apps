import { PrismaService } from '../../../../core/database/prisma.service.js';

/**
 * Option lists backing the bulk-import template's dropdowns. They read grade
 * and classroom tables rather than student, so they sit apart from the
 * student persistence proper.
 */

export async function findActiveGradeLevels(
  prisma: PrismaService,
): Promise<number[]> {
  const grades = await prisma.grade.findMany({
    where: { deletedAt: null, isActive: true },
    select: { level: true },
    orderBy: { level: 'asc' },
  });
  return grades.map((g) => g.level);
}

export async function findActiveClassroomCodes(
  prisma: PrismaService,
): Promise<string[]> {
  const classrooms = await prisma.classroom.findMany({
    where: { deletedAt: null, isActive: true },
    select: { code: true },
    orderBy: { code: 'asc' },
  });
  return classrooms.map((c) => c.code);
}
