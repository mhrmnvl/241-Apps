import { PrismaService } from '../../../../core/database/prisma.service.js';
import { PresenceSubjectTypeEnum } from '../../../credential/domain/entities/credential.entity.js';
import {
  PresenceRecapRow,
  RecapQueryInput,
} from '../../domain/interfaces/daily-presence-recap.interface.js';

/** First and last instant of a month, in the wall-clock frame the school uses. */
export function monthBounds(year: number, month: number) {
  return {
    from: new Date(Date.UTC(year, month - 1, 1)),
    to: new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)),
  };
}

function blankRow(
  userId: string,
  displayName: string | null,
): PresenceRecapRow {
  return {
    userId,
    displayName,
    presentDays: 0,
    absentDays: 0,
    lateCount: 0,
    lateMinutes: 0,
    earlyLeaveCount: 0,
    leaveDays: 0,
    officialDutyDays: 0,
    attendanceRate: 0,
  };
}

/**
 * The monthly recap, split out of the repository class to keep it inside the
 * 200-line budget.
 *
 * The roster comes from **active credentials**, not from `academic/`. That is
 * the same choice ADR-0007 made for the expected-days window, and it has the
 * property the recap needs: someone with no rows at all in the month — long
 * leave, a new hire — still appears with zeros rather than vanishing from the
 * report entirely.
 */
export async function getPresenceRecap(
  prisma: PrismaService,
  query: RecapQueryInput,
): Promise<PresenceRecapRow[]> {
  const { year, month } = query;
  const { from, to } = monthBounds(year, month);
  const subjectType: PresenceSubjectTypeEnum = query.subjectType ?? 'EMPLOYEE';

  const roster = await prisma.presenceCredential.findMany({
    where: {
      status: 'ACTIVE',
      deletedAt: null,
      subjectType,
      ...(query.userId && { userId: query.userId }),
    },
    select: {
      userId: true,
      user: { select: { profile: { select: { name: true } } } },
    },
  });

  const rows = new Map<string, PresenceRecapRow>(
    roster.map((entry) => [
      entry.userId,
      blankRow(entry.userId, entry.user.profile?.name ?? null),
    ]),
  );

  if (rows.size === 0) return [];

  const records = await prisma.dailyPresence.findMany({
    where: {
      userId: { in: [...rows.keys()] },
      date: { gte: from, lte: to },
      deletedAt: null,
    },
    select: {
      userId: true,
      status: true,
      lateMinutes: true,
      earlyLeaveMinutes: true,
    },
  });

  for (const record of records) {
    const row = rows.get(record.userId);
    if (!row) continue;

    if (record.status === 'PRESENT' || record.status === 'LATE') {
      row.presentDays++;
    }
    if (record.status === 'ABSENT') row.absentDays++;
    if (record.status === 'LATE') row.lateCount++;
    if (record.status === 'ON_LEAVE') row.leaveDays++;
    if (record.status === 'OFFICIAL_DUTY') row.officialDutyDays++;
    if (record.earlyLeaveMinutes > 0) row.earlyLeaveCount++;

    row.lateMinutes += record.lateMinutes;
  }

  return [...rows.values()].map(withRate).sort(byName);
}

/**
 * Days the person was expected is presentDays + absentDays — leave and holidays
 * are excluded from the denominator, so a month spent on approved leave reads as
 * 100% rather than 0% (FR-026, FR-030).
 */
function withRate(row: PresenceRecapRow): PresenceRecapRow {
  const expected = row.presentDays + row.absentDays;
  return {
    ...row,
    attendanceRate:
      expected === 0 ? 0 : Math.round((row.presentDays / expected) * 1000) / 10,
  };
}

function byName(a: PresenceRecapRow, b: PresenceRecapRow): number {
  return (a.displayName ?? '').localeCompare(b.displayName ?? '');
}

/** How many working days the period held, for the recap header. */
export async function countWorkingDays(
  prisma: PrismaService,
  year: number,
  month: number,
): Promise<number> {
  const { from, to } = monthBounds(year, month);

  const [pattern, holidays] = await Promise.all([
    prisma.workPattern.findFirst({
      where: { isDefault: true, deletedAt: null },
      include: { days: true },
    }),
    prisma.nonWorkingDay.count({
      where: { date: { gte: from, lte: to }, deletedAt: null },
    }),
  ]);

  if (!pattern) return 0;

  const working = new Set(
    pattern.days.filter((day) => day.isWorkingDay).map((day) => day.weekday),
  );

  let count = 0;
  for (
    let day = new Date(from);
    day <= to;
    day.setUTCDate(day.getUTCDate() + 1)
  ) {
    if (working.has(day.getUTCDay())) count++;
  }

  return Math.max(0, count - holidays);
}
