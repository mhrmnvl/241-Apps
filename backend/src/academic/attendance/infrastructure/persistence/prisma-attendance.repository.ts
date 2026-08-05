import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { resolveSemesterId } from '../../../../shared/utils/active-academic-year.helper.js';
import { AttendanceEntity } from '../../domain/entities/attendance.entity.js';
import {
  AttendanceQueryInput,
  AttendanceRecapQueryInput,
  AttendanceStatusCounts,
  AttendanceTrendQueryInput,
  BulkAttendanceRecord,
  CreateAttendanceRepositoryInput,
  IAttendanceRepository,
  RestoreAttendanceRepositoryInput,
  UpdateAttendanceRepositoryInput,
} from '../../domain/interfaces/attendance-repository.interface.js';
import { ATTENDANCE_WITH_DETAILS_INCLUDE as ATTENDANCE_INCLUDE } from './prisma-attendance.includes.js';
import { buildAttendanceListWhere } from './prisma-attendance.where.js';
import {
  buildAttendanceMonthlyTrend,
  buildAttendanceRecap,
  buildAttendanceStatusCounts,
} from './prisma-attendance.reports.js';

@Injectable()
export class PrismaAttendanceRepository extends IAttendanceRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAttendance(
    teachingAssignmentId: string,
    studentEnrollmentId: string,
    date: Date,
    excludeId?: string,
  ): Promise<AttendanceEntity | null> {
    return this.prisma.attendance.findFirst({
      where: {
        enrollmentId: studentEnrollmentId,
        date,
        deletedAt: null,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
  }

  async findAll(query: AttendanceQueryInput) {
    const { page = 1, limit = 10, semesterId } = query;
    const resolvedSemesterId =
      semesterId ?? (await resolveSemesterId(this.prisma));
    const where = buildAttendanceListWhere(query, resolvedSemesterId);

    const [data, total] = await Promise.all([
      this.prisma.attendance.findMany({
        where,
        skip: (page - 1) * limit,
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
      where: { id, deletedAt: null, enrollment: {} },
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

  async create(data: CreateAttendanceRepositoryInput) {
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

  async update(id: string, data: UpdateAttendanceRepositoryInput) {
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

  async restore(id: string, data: RestoreAttendanceRepositoryInput) {
    return this.prisma.attendance.update({
      where: { id },
      data: { status: data.status, note: data.note, deletedAt: null },
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
    records: BulkAttendanceRecord[],
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

  async getRecap(query: AttendanceRecapQueryInput) {
    return buildAttendanceRecap(this.prisma, query);
  }

  async getStatusCounts(enrollmentId: string): Promise<AttendanceStatusCounts> {
    return buildAttendanceStatusCounts(this.prisma, enrollmentId);
  }

  async getMonthlyTrend(query: AttendanceTrendQueryInput) {
    return buildAttendanceMonthlyTrend(this.prisma, query);
  }

  async remove(id: string) {
    return this.softDelete(id);
  }
}
