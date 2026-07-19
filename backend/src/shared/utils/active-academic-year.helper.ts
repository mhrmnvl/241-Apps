import { PrismaService } from '../../core/database/prisma.service.js';

export async function resolveAcademicYearId(
  prisma: PrismaService,
  academicYearId?: string,
): Promise<string | undefined> {
  if (academicYearId) return academicYearId;

  const active = await prisma.academicYear.findFirst({
    where: { isActive: true, deletedAt: null },
    select: { id: true },
  });
  return active?.id;
}

export async function resolveSemesterId(
  prisma: PrismaService,
  semesterId?: string,
): Promise<string | undefined> {
  if (semesterId) return semesterId;

  const active = await prisma.semester.findFirst({
    where: { isActive: true, deletedAt: null },
    select: { id: true },
  });
  return active?.id;
}
