import { PrismaService } from '../../../../core/database/prisma.service.js';
import { NonWorkingDayEntity } from '../../domain/entities/work-pattern.entity.js';
import {
  NonWorkingDayInput,
  NonWorkingDayQueryInput,
} from '../../domain/interfaces/work-pattern-repository.interface.js';

/**
 * School and national holidays.
 *
 * Split from the repository class because it is a separate table with its own
 * lifecycle — imported in bulk from the academic calendar, edited one row at a
 * time — and it is what pushed that class past the constitution's 200-line
 * budget.
 */

export async function findNonWorkingDays(
  prisma: PrismaService,
  query: NonWorkingDayQueryInput,
): Promise<NonWorkingDayEntity[]> {
  return prisma.nonWorkingDay.findMany({
    where: {
      deletedAt: null,
      ...((query.from ?? query.to) && {
        date: {
          ...(query.from && { gte: query.from }),
          ...(query.to && { lte: query.to }),
        },
      }),
    },
    orderBy: { date: 'asc' },
  });
}

/**
 * A re-import skips dates already held rather than replacing them.
 *
 * The school may have renamed an imported holiday or added one by hand; a
 * second import of the same calendar must not quietly undo that. The counts
 * come back so the screen can say what actually happened.
 */
export async function bulkUpsertNonWorkingDays(
  prisma: PrismaService,
  days: NonWorkingDayInput[],
): Promise<{ imported: number; skipped: number }> {
  if (days.length === 0) return { imported: 0, skipped: 0 };

  const existing = await prisma.nonWorkingDay.findMany({
    where: { date: { in: days.map((day) => day.date) }, deletedAt: null },
    select: { date: true },
  });

  const held = new Set(existing.map((row) => row.date.getTime()));
  const fresh = days.filter((day) => !held.has(day.date.getTime()));

  if (fresh.length > 0) {
    await prisma.nonWorkingDay.createMany({
      data: fresh.map((day) => ({
        date: day.date,
        name: day.name,
        sourceCalendarId: day.sourceCalendarId ?? null,
      })),
    });
  }

  return { imported: fresh.length, skipped: days.length - fresh.length };
}

export async function updateNonWorkingDay(
  prisma: PrismaService,
  id: string,
  name: string,
): Promise<NonWorkingDayEntity> {
  return prisma.nonWorkingDay.update({ where: { id }, data: { name } });
}

/** Soft delete: the day still explains why nobody was marked absent on it. */
export async function deleteNonWorkingDay(
  prisma: PrismaService,
  id: string,
): Promise<void> {
  await prisma.nonWorkingDay.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}
