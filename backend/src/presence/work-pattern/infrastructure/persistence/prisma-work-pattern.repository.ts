import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import {
  NonWorkingDayEntity,
  WorkPatternAssignmentWithDetails,
  WorkPatternDayEntity,
  WorkPatternEntity,
  WorkPatternWithDays,
} from '../../domain/entities/work-pattern.entity.js';
import {
  AssignWorkPatternInput,
  CreateWorkPatternInput,
  IWorkPatternRepository,
  NonWorkingDayInput,
  NonWorkingDayQueryInput,
  ResolvedPattern,
  UpdateWorkPatternInput,
  WorkPatternDayInput,
} from '../../domain/interfaces/work-pattern-repository.interface.js';
import * as assignments from './prisma-work-pattern.assignments.js';
import * as holidays from './prisma-work-pattern.holidays.js';

/** No pattern exists at all — a fresh install before the seed has run. */
const NO_PATTERN: ResolvedPattern = {
  workPatternId: null,
  patternName: null,
  isWorkingDay: true,
  startTime: null,
  endTime: null,
  graceMinutes: 0,
};

@Injectable()
export class PrismaWorkPatternRepository implements IWorkPatternRepository {
  constructor(private readonly prisma: PrismaService) {}

  async resolveForUserAndDate(
    userId: string,
    date: Date,
  ): Promise<ResolvedPattern> {
    const assignment = await this.prisma.workPatternAssignment.findFirst({
      where: {
        userId,
        deletedAt: null,
        effectiveFrom: { lte: date },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: date } }],
      },
      orderBy: { effectiveFrom: 'desc' },
      select: { workPatternId: true },
    });

    const pattern = await this.prisma.workPattern.findFirst({
      where: assignment
        ? { id: assignment.workPatternId, deletedAt: null }
        : { isDefault: true, deletedAt: null },
      include: { days: true },
    });

    if (!pattern) return NO_PATTERN;

    const day = pattern.days.find((d) => d.weekday === date.getUTCDay());

    return {
      workPatternId: pattern.id,
      patternName: pattern.name,
      graceMinutes: pattern.graceMinutes,
      isWorkingDay: day?.isWorkingDay ?? true,
      startTime: day?.startTime ?? null,
      endTime: day?.endTime ?? null,
    };
  }

  async isNonWorkingDay(date: Date): Promise<boolean> {
    const count = await this.prisma.nonWorkingDay.count({
      where: { date, deletedAt: null },
    });

    return count > 0;
  }

  // --- Pattern management (User Story 4) ---

  async findAll(): Promise<WorkPatternWithDays[]> {
    return this.prisma.workPattern.findMany({
      where: { deletedAt: null },
      include: { days: { orderBy: { weekday: 'asc' } } },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });
  }

  async findById(id: string): Promise<WorkPatternWithDays | null> {
    return this.prisma.workPattern.findFirst({
      where: { id, deletedAt: null },
      include: { days: { orderBy: { weekday: 'asc' } } },
    });
  }

  async create(input: CreateWorkPatternInput): Promise<WorkPatternEntity> {
    return this.prisma.workPattern.create({ data: input });
  }

  async update(
    id: string,
    input: UpdateWorkPatternInput,
  ): Promise<WorkPatternEntity> {
    return this.prisma.workPattern.update({ where: { id }, data: input });
  }

  async softDelete(id: string): Promise<WorkPatternEntity> {
    return this.prisma.workPattern.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * All seven weekdays land together. A partial write could leave a pattern
   * with no Friday, which would silently make Friday non-working for everyone
   * assigned to it.
   */
  async replaceDays(
    workPatternId: string,
    days: WorkPatternDayInput[],
  ): Promise<WorkPatternDayEntity[]> {
    return this.prisma.$transaction(async (tx) => {
      await tx.workPatternDay.deleteMany({ where: { workPatternId } });
      await tx.workPatternDay.createMany({
        data: days.map((day) => ({ ...day, workPatternId })),
      });

      return tx.workPatternDay.findMany({
        where: { workPatternId },
        orderBy: { weekday: 'asc' },
      });
    });
  }

  async countAssignments(workPatternId: string): Promise<number> {
    return this.prisma.workPatternAssignment.count({
      where: { workPatternId, deletedAt: null },
    });
  }

  // --- Assignments (implemented in `.assignments.ts`) ---

  async findAssignments(
    userId?: string,
  ): Promise<WorkPatternAssignmentWithDetails[]> {
    return assignments.findAssignments(this.prisma, userId);
  }

  async assign(
    input: AssignWorkPatternInput,
  ): Promise<WorkPatternAssignmentWithDetails> {
    return assignments.assign(this.prisma, input);
  }

  async removeAssignment(id: string): Promise<void> {
    return assignments.removeAssignment(this.prisma, id);
  }

  // --- Non-working days (implemented in `.holidays.ts`) ---

  async findNonWorkingDays(
    query: NonWorkingDayQueryInput,
  ): Promise<NonWorkingDayEntity[]> {
    return holidays.findNonWorkingDays(this.prisma, query);
  }

  async bulkUpsertNonWorkingDays(
    days: NonWorkingDayInput[],
  ): Promise<{ imported: number; skipped: number }> {
    return holidays.bulkUpsertNonWorkingDays(this.prisma, days);
  }

  async updateNonWorkingDay(
    id: string,
    name: string,
  ): Promise<NonWorkingDayEntity> {
    return holidays.updateNonWorkingDay(this.prisma, id, name);
  }

  async deleteNonWorkingDay(id: string): Promise<void> {
    return holidays.deleteNonWorkingDay(this.prisma, id);
  }
}
