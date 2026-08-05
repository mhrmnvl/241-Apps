import { PrismaService } from '../../../../core/database/prisma.service.js';
import {
  AttendanceMonthlyTrendPoint,
  AttendanceRecapQueryInput,
  AttendanceStatusCounts,
  AttendanceTrendQueryInput,
} from '../../domain/interfaces/attendance-repository.interface.js';

/**
 * Read-only aggregations over attendance rows. They group in memory rather
 * than in SQL — the row counts are per-classroom-per-semester, so the simpler
 * code wins over a raw query.
 */

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

/** (PRESENT + LATE) / total * 100, rounded to 1 decimal. 0 when total is 0. */
function calcPercentage(counts: {
  PRESENT: number;
  LATE: number;
  total: number;
}): number {
  if (counts.total === 0) return 0;
  return (
    Math.round(((counts.PRESENT + counts.LATE) / counts.total) * 1000) / 10
  );
}

export async function buildAttendanceRecap(
  prisma: PrismaService,
  query: AttendanceRecapQueryInput,
) {
  const { classroomId, semesterId, month, year } = query;

  // month/year both present -> scope to that calendar month; otherwise the
  // legacy whole-semester behavior (no date filter) is preserved.
  const dateRange =
    month && year
      ? {
          gte: new Date(year, month - 1, 1),
          lte: new Date(year, month, 0, 23, 59, 59, 999),
        }
      : undefined;

  const attendances = await prisma.attendance.findMany({
    where: {
      deletedAt: null,
      ...(dateRange && { date: dateRange }),
      enrollment: { classroomId, semesterId, deletedAt: null },
    },
    select: {
      enrollmentId: true,
      status: true,
      enrollment: {
        select: {
          student: {
            select: {
              nis: true,
              user: { select: { profile: { select: { name: true } } } },
            },
          },
        },
      },
    },
  });

  const recapMap = new Map<
    string,
    {
      enrollmentId: string;
      studentName: string;
      nis: string;
      PRESENT: number;
      SICK: number;
      EXCUSED: number;
      ABSENT: number;
      LATE: number;
    }
  >();

  for (const att of attendances) {
    if (!recapMap.has(att.enrollmentId)) {
      recapMap.set(att.enrollmentId, {
        enrollmentId: att.enrollmentId,
        studentName: att.enrollment.student.user.profile?.name ?? '-',
        nis: att.enrollment.student.nis,
        PRESENT: 0,
        SICK: 0,
        EXCUSED: 0,
        ABSENT: 0,
        LATE: 0,
      });
    }
    const entry = recapMap.get(att.enrollmentId)!;
    entry[att.status]++;
  }

  return Array.from(recapMap.values()).map((entry) => {
    const total =
      entry.PRESENT + entry.SICK + entry.EXCUSED + entry.ABSENT + entry.LATE;
    return { ...entry, total, percentage: calcPercentage({ ...entry, total }) };
  });
}

export async function buildAttendanceStatusCounts(
  prisma: PrismaService,
  enrollmentId: string,
): Promise<AttendanceStatusCounts> {
  const grouped = await prisma.attendance.groupBy({
    by: ['status'],
    where: { enrollmentId, deletedAt: null },
    _count: { _all: true },
  });

  const counts: AttendanceStatusCounts = { sick: 0, excused: 0, absent: 0 };
  for (const group of grouped) {
    if (group.status === 'SICK') counts.sick = group._count._all;
    else if (group.status === 'EXCUSED') counts.excused = group._count._all;
    else if (group.status === 'ABSENT') counts.absent = group._count._all;
  }
  return counts;
}

export async function buildAttendanceMonthlyTrend(
  prisma: PrismaService,
  query: AttendanceTrendQueryInput,
) {
  const { classroomId, semesterId } = query;

  const attendances = await prisma.attendance.findMany({
    where: {
      deletedAt: null,
      enrollment: { classroomId, semesterId, deletedAt: null },
    },
    select: { status: true, date: true },
  });

  const trendMap = new Map<
    string,
    Omit<AttendanceMonthlyTrendPoint, 'total' | 'percentage'>
  >();

  for (const att of attendances) {
    const year = att.date.getFullYear();
    const month = att.date.getMonth() + 1;
    const key = `${year}-${month}`;
    if (!trendMap.has(key)) {
      trendMap.set(key, {
        year,
        month,
        monthLabel: `${MONTH_LABELS[month - 1]} ${year}`,
        PRESENT: 0,
        SICK: 0,
        EXCUSED: 0,
        ABSENT: 0,
        LATE: 0,
      });
    }
    const entry = trendMap.get(key)!;
    entry[att.status]++;
  }

  return Array.from(trendMap.values())
    .map((entry) => {
      const total =
        entry.PRESENT + entry.SICK + entry.EXCUSED + entry.ABSENT + entry.LATE;
      return {
        ...entry,
        total,
        percentage: calcPercentage({
          PRESENT: entry.PRESENT,
          LATE: entry.LATE,
          total,
        }),
      };
    })
    .sort((a, b) => a.year - b.year || a.month - b.month);
}
