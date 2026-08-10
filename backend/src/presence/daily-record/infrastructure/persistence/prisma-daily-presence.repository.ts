import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';
import {
  DailyPresenceQueryInput,
  DailyPresenceWithDetails,
  PresenceRecapRow,
  RecapQueryInput,
} from '../../domain/interfaces/daily-presence-recap.interface.js';
import { IPresenceCorrectionRepository } from '../../domain/interfaces/presence-correction-repository.interface.js';
import {
  countWorkingDays,
  getPresenceRecap,
  monthBounds,
} from './prisma-daily-presence.reports.js';
import * as readPort from './prisma-daily-presence.read-port.js';
import * as writer from './prisma-daily-presence.writer.js';
import { DailyPresenceEntity } from '../../domain/entities/daily-presence.entity.js';
import {
  CorrectPresenceInput,
  IDailyPresenceRepository,
  ManualPresenceInput,
  RecordCheckOutInput,
  UpsertCheckInInput,
} from '../../domain/interfaces/daily-presence-repository.interface.js';
import {
  GateSuggestion,
  IDailyPresenceReadPort,
  MonthlyPresenceSummary,
} from '../../domain/interfaces/daily-presence-read.port.js';

@Injectable()
export class PrismaDailyPresenceRepository
  implements IDailyPresenceRepository, IDailyPresenceReadPort
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly corrections: IPresenceCorrectionRepository,
  ) {}

  /**
   * The TU day list. `corrected` is resolved for the whole page in one query
   * rather than per row — the screen shows every employee, so an N+1 here is
   * the difference between a page load and a page wait.
   */
  async findAll(
    query: DailyPresenceQueryInput,
  ): Promise<PaginatedResult<DailyPresenceWithDetails>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const where: Prisma.DailyPresenceWhereInput = {
      date: query.date,
      deletedAt: null,
      ...(query.subjectType && { subjectType: query.subjectType }),
      ...(query.userId && { userId: query.userId }),
      ...(query.status && { status: query.status }),
    };

    const [rows, total] = await Promise.all([
      this.prisma.dailyPresence.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              identifier: true,
              profile: { select: { name: true } },
            },
          },
        },
        orderBy: { user: { identifier: 'asc' } },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.dailyPresence.count({ where }),
    ]);

    const correctedIds = await this.corrections.findCorrectedIds(
      rows.map((row) => row.id),
    );

    return {
      data: rows.map(({ user, ...record }) => ({
        ...record,
        holder: {
          id: user.id,
          identifier: user.identifier,
          displayName: user.profile?.name ?? null,
        },
        corrected: correctedIds.has(record.id),
      })),
      total,
      page,
      limit,
    };
  }

  async findByUserAndMonth(
    userId: string,
    year: number,
    month: number,
  ): Promise<DailyPresenceEntity[]> {
    const { from, to } = monthBounds(year, month);

    return this.prisma.dailyPresence.findMany({
      where: { userId, date: { gte: from, lte: to }, deletedAt: null },
      orderBy: { date: 'asc' },
    });
  }

  async getRecap(query: RecapQueryInput): Promise<PresenceRecapRow[]> {
    return getPresenceRecap(this.prisma, query);
  }

  async countWorkingDays(year: number, month: number): Promise<number> {
    return countWorkingDays(this.prisma, year, month);
  }

  async findById(id: string): Promise<DailyPresenceEntity | null> {
    return this.prisma.dailyPresence.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByUserAndDate(
    userId: string,
    date: Date,
  ): Promise<DailyPresenceEntity | null> {
    return this.prisma.dailyPresence.findFirst({
      where: { userId, date, deletedAt: null },
    });
  }

  /** Writes live in `.writer.ts`; the leave-preserving rule is stated there. */
  async upsertCheckIn(input: UpsertCheckInInput): Promise<DailyPresenceEntity> {
    const existing = await this.findByUserAndDate(input.userId, input.date);

    return writer.upsertCheckIn(this.prisma, existing, input);
  }

  async recordCheckOut(
    input: RecordCheckOutInput,
  ): Promise<DailyPresenceEntity> {
    return writer.recordCheckOut(this.prisma, input);
  }

  async createManual(input: ManualPresenceInput): Promise<DailyPresenceEntity> {
    return writer.createManual(this.prisma, input);
  }

  async correct(
    id: string,
    input: CorrectPresenceInput,
  ): Promise<DailyPresenceEntity> {
    return writer.correct(this.prisma, id, input);
  }

  // --- IDailyPresenceReadPort: what academic/ and payroll/ see ---

  async findByUsersAndDate(
    userIds: string[],
    date: Date,
  ): Promise<GateSuggestion[]> {
    return readPort.findByUsersAndDate(this.prisma, userIds, date);
  }

  async summariseMonth(
    userIds: string[],
    year: number,
    month: number,
  ): Promise<MonthlyPresenceSummary[]> {
    return readPort.summariseMonth(this.prisma, userIds, year, month);
  }
}
