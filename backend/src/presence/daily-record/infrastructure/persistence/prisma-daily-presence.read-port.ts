import { PrismaService } from '../../../../core/database/prisma.service.js';
import {
  GateSuggestion,
  MonthlyPresenceSummary,
} from '../../domain/interfaces/daily-presence-read.port.js';

/**
 * What `academic/` and `payroll/` see of the gate.
 *
 * Split out of the repository class because it is the narrower of the two
 * abstractions the same Prisma client backs, and it has a different audience:
 * everything here answers another domain's question, not presence's own.
 */

export async function findByUsersAndDate(
  prisma: PrismaService,
  userIds: string[],
  date: Date,
): Promise<GateSuggestion[]> {
  if (userIds.length === 0) return [];

  const rows = await prisma.dailyPresence.findMany({
    where: { userId: { in: userIds }, date, deletedAt: null },
    select: { userId: true, status: true, checkInAt: true, lateMinutes: true },
  });

  return rows.map((row) => ({
    userId: row.userId,
    status: row.status,
    checkInAt: row.checkInAt,
    lateMinutes: row.lateMinutes,
  }));
}

export async function summariseMonth(
  prisma: PrismaService,
  userIds: string[],
  year: number,
  month: number,
): Promise<MonthlyPresenceSummary[]> {
  if (userIds.length === 0) return [];

  const rows = await prisma.dailyPresence.findMany({
    where: {
      userId: { in: userIds },
      date: {
        gte: new Date(Date.UTC(year, month - 1, 1)),
        lte: new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)),
      },
      deletedAt: null,
    },
    select: {
      userId: true,
      status: true,
      lateMinutes: true,
      earlyLeaveMinutes: true,
    },
  });

  const summaries = new Map<string, MonthlyPresenceSummary>(
    userIds.map((userId) => [userId, blankSummary(userId)]),
  );

  for (const row of rows) {
    const summary = summaries.get(row.userId);
    if (!summary) continue;

    if (row.status === 'PRESENT' || row.status === 'LATE') {
      summary.presentDays++;
    }
    if (row.status === 'ABSENT') summary.absentDays++;
    if (row.status === 'LATE') summary.lateCount++;
    if (row.status === 'ON_LEAVE') summary.leaveDays++;
    if (row.status === 'OFFICIAL_DUTY') summary.officialDutyDays++;
    if (row.earlyLeaveMinutes > 0) summary.earlyLeaveCount++;

    summary.lateMinutes += row.lateMinutes;
  }

  return [...summaries.values()];
}

/**
 * Everyone asked for appears, including someone with no rows at all — payroll
 * must produce a defensible figure for an employee on long leave rather than
 * silently omitting them (FR-054).
 */
function blankSummary(userId: string): MonthlyPresenceSummary {
  return {
    userId,
    presentDays: 0,
    absentDays: 0,
    lateCount: 0,
    lateMinutes: 0,
    earlyLeaveCount: 0,
    leaveDays: 0,
    officialDutyDays: 0,
  };
}
