import { Injectable } from '@nestjs/common';
import { AttendanceStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import {
  AttendanceQueryDto,
  AttendanceRecapQueryDto,
  BulkAttendanceRecordDto,
} from '../../dto/request/attendance.dto.js';
import { resolveSemesterId } from '../../../../shared/utils/active-academic-year.helper.js';
import {
  IAttendanceRepository,
  ATTENDANCE_INCLUDE,
} from '../../domain/interfaces/attendance-repository.interface.js';

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
    const { classroomId, semesterId } = query;

    const attendances = await this.prisma.attendance.findMany({
      where: {
        deletedAt: null,
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

    return Array.from(recapMap.values());
  }
}
