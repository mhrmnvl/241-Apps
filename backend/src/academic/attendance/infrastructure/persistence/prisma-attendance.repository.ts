import { Injectable } from '@nestjs/common';
import { AttendanceStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import {
  AttendanceQueryDto,
  AttendanceRecapQueryDto,
  AttendanceTrendQueryDto,
  BulkAttendanceRecordDto,
} from '../../dto/request/attendance.dto.js';
import { resolveSemesterId } from '../../../../shared/utils/active-academic-year.helper.js';
import {
  IAttendanceRepository,
  ATTENDANCE_INCLUDE,
  AttendanceMonthlyTrendPoint,
  AttendanceStatusCounts,
} from '../../domain/interfaces/attendance-repository.interface.js';

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

@Injectable()
export class PrismaAttendanceRepository extends IAttendanceRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(query: AttendanceQueryDto) {
    const {
      page = 1,
      limit = 10,
      enrollmentId,
      scheduleId,
      classroomId,
      semesterId,
      status,
      date,
    } = query;
    const skip = (page - 1) * limit;

    const resolvedSemesterId =
      semesterId ?? (await resolveSemesterId(this.prisma));

    const where: Prisma.AttendanceWhereInput = {
      deletedAt: null,
      enrollment: {},
      ...(enrollmentId && { enrollmentId }),
      ...(scheduleId && { scheduleId }),
      ...(status && { status: status }),
      ...(date && { date: new Date(date) }),
      ...(classroomId && {
        enrollment: { classroomId, deletedAt: null },
      }),
      ...(resolvedSemesterId &&
        !enrollmentId &&
        !scheduleId && {
          OR: [
            { enrollment: { semesterId: resolvedSemesterId } },
            {
              schedule: {
                teachingAssignment: {
                  semesterId: resolvedSemesterId,
                },
              },
            },
          ],
        }),
    };

    const [data, total] = await Promise.all([
      this.prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: ATTENDANCE_INCLUDE,
      }),
      this.prisma.attendance.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findById(id: string) {
    return this.prisma.attendance.findFirst({
      where: {
        id,
        deletedAt: null,
        enrollment: {},
      },
      include: ATTENDANCE_INCLUDE,
    });
  }

  async findDuplicate(
    enrollmentId: string,
    date: Date,
    scheduleId?: string,
    excludeId?: string,
  ) {
    return this.prisma.attendance.findFirst({
      where: {
        enrollmentId,
        date,
        scheduleId: scheduleId ?? null,
        deletedAt: null,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
  }

  async create(data: {
    enrollmentId: string;
    date: Date;
    status: AttendanceStatus;
    scheduleId?: string;
    note?: string;
  }) {
    return this.prisma.attendance.create({
      data: {
        enrollmentId: data.enrollmentId,
        date: data.date,
        status: data.status,
        scheduleId: data.scheduleId,
        note: data.note,
      },
    });
  }

  async update(id: string, data: Prisma.AttendanceUpdateInput) {
    return this.prisma.attendance.update({ where: { id }, data });
  }

  async findSoftDeleted(enrollmentId: string, date: Date, scheduleId?: string) {
    return this.prisma.attendance.findFirst({
      where: {
        enrollmentId,
        date,
        scheduleId: scheduleId ?? null,
        deletedAt: { not: null },
      },
    });
  }

  async restore(id: string, data: { status: AttendanceStatus; note?: string }) {
    return this.prisma.attendance.update({
      where: { id },
      data: {
        status: data.status,
        note: data.note,
        deletedAt: null,
      },
    });
  }

  async softDelete(id: string) {
    return this.prisma.attendance.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async bulkUpsert(
    date: Date,
    records: BulkAttendanceRecordDto[],
    scheduleId?: string,
  ) {
    const results = await this.prisma.$transaction(
      records.map((record) =>
        this.prisma.attendance.upsert({
          where: {
            enrollmentId_date_scheduleId: {
              enrollmentId: record.enrollmentId,
              date,
              scheduleId: (scheduleId ?? null)!,
            },
          },
          update: {
            status: record.status,
            note: record.note,
            deletedAt: null,
          },
          create: {
            enrollmentId: record.enrollmentId,
            date,
            status: record.status,
            scheduleId: scheduleId ?? undefined,
            note: record.note,
          },
        }),
      ),
    );
    return { saved: results.length };
  }

  async getRecap(query: AttendanceRecapQueryDto) {
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

    const attendances = await this.prisma.attendance.findMany({
      where: {
        deletedAt: null,
        ...(dateRange && { date: dateRange }),
        enrollment: {
          classroomId,
          semesterId,
          deletedAt: null,
        },
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
      return {
        ...entry,
        total,
        percentage: calcPercentage({ ...entry, total }),
      };
    });
  }

  async getStatusCounts(enrollmentId: string): Promise<AttendanceStatusCounts> {
    const grouped = await this.prisma.attendance.groupBy({
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

  async getMonthlyTrend(query: AttendanceTrendQueryDto) {
    const { classroomId, semesterId } = query;

    // Whole-semester query (no date filter), then grouped in-memory by
    // calendar month — same style as getRecap, no raw SQL needed.
    const attendances = await this.prisma.attendance.findMany({
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
          entry.PRESENT +
          entry.SICK +
          entry.EXCUSED +
          entry.ABSENT +
          entry.LATE;
        return {
          ...entry,
          total,
          percentage: calcPercentage({ ...entry, total }),
        };
      })
      .sort((a, b) => a.year - b.year || a.month - b.month);
  }
}
