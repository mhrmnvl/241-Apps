import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service.js';
import { AttendancePeriodEntity } from '../domain/entities/attendance-period.entity.js';
import { IAttendancePeriodRepository } from '../domain/interfaces/attendance-period-repository.interface.js';

/** How many blocking records to name before the message gets useless. */
const MAX_LISTED = 10;

export interface IncompleteRecord {
  userId: string;
  displayName: string | null;
  date: string;
}

@Injectable()
export class CloseAttendancePeriodUseCase {
  constructor(
    private readonly periods: IAttendancePeriodRepository,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Closing a month is what fixes payroll's inputs, so it refuses while any
   * record is still incomplete.
   *
   * A day with an arrival and no departure is not a finished day — nobody has
   * decided whether the person left early, forgot to tap, or was on official
   * duty. Closing over it would carry that ambiguity straight into a payslip,
   * and an approved payroll run cannot be edited afterwards (FR-050). Better a
   * refusal now than an adjustment run later.
   */
  async execute(
    year: number,
    month: number,
    closedBy: string,
  ): Promise<AttendancePeriodEntity> {
    const existing = await this.periods.findByPeriod(year, month);
    if (existing?.status === 'CLOSED') {
      throw new ConflictException('This period is already closed.');
    }

    const incomplete = await this.findIncomplete(year, month);
    if (incomplete.length > 0) {
      throw new ConflictException({
        message: `${incomplete.length} record(s) have no check-out and must be resolved before closing.`,
        incomplete: incomplete.slice(0, MAX_LISTED),
        total: incomplete.length,
      });
    }

    return this.periods.close({
      year,
      month,
      closedBy,
      closedAt: new Date(),
    });
  }

  /**
   * Only days somebody actually attended can be incomplete. `ABSENT`,
   * `ON_LEAVE` and `NOT_EXPECTED` have no check-out by definition, so
   * demanding one would make a month with a single holiday impossible to close.
   */
  private async findIncomplete(
    year: number,
    month: number,
  ): Promise<IncompleteRecord[]> {
    const from = new Date(Date.UTC(year, month - 1, 1));
    const to = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const rows = await this.prisma.dailyPresence.findMany({
      where: {
        date: { gte: from, lte: to },
        deletedAt: null,
        checkInAt: { not: null },
        checkOutAt: null,
        status: { in: ['PRESENT', 'LATE'] },
      },
      select: {
        userId: true,
        date: true,
        user: { select: { profile: { select: { name: true } } } },
      },
      orderBy: { date: 'asc' },
    });

    return rows.map((row) => ({
      userId: row.userId,
      displayName: row.user.profile?.name ?? null,
      date: row.date.toISOString().slice(0, 10),
    }));
  }
}
