import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { AttendancePeriodEntity } from '../../domain/entities/attendance-period.entity.js';
import {
  AttendancePeriodQueryInput,
  ClosePeriodRepositoryInput,
  IAttendancePeriodRepository,
} from '../../domain/interfaces/attendance-period-repository.interface.js';

@Injectable()
export class PrismaAttendancePeriodRepository implements IAttendancePeriodRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: AttendancePeriodQueryInput,
  ): Promise<AttendancePeriodEntity[]> {
    return this.prisma.attendancePeriod.findMany({
      where: {
        ...(query.year !== undefined && { year: query.year }),
        ...(query.status && { status: query.status }),
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async findByPeriod(
    year: number,
    month: number,
  ): Promise<AttendancePeriodEntity | null> {
    return this.prisma.attendancePeriod.findUnique({
      where: { year_month: { year, month } },
    });
  }

  /**
   * A month with no row has never been closed, so it is open. Modelling the
   * absence as "open" rather than seeding a row per month keeps the table to
   * the months someone actually closed.
   */
  async isClosed(year: number, month: number): Promise<boolean> {
    const period = await this.prisma.attendancePeriod.findUnique({
      where: { year_month: { year, month } },
      select: { status: true },
    });

    return period?.status === 'CLOSED';
  }

  async close(
    input: ClosePeriodRepositoryInput,
  ): Promise<AttendancePeriodEntity> {
    const { year, month, closedBy, closedAt } = input;

    return this.prisma.attendancePeriod.upsert({
      where: { year_month: { year, month } },
      create: { year, month, status: 'CLOSED', closedBy, closedAt },
      update: { status: 'CLOSED', closedBy, closedAt },
    });
  }
}
