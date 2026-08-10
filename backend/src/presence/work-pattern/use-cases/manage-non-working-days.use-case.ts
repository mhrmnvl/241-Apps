import { Injectable, NotFoundException } from '@nestjs/common';
import {
  WorkPatternAssignmentWithDetails,
  NonWorkingDayEntity,
} from '../domain/entities/work-pattern.entity.js';
import { IWorkPatternRepository } from '../domain/interfaces/work-pattern-repository.interface.js';
import { AssignWorkPatternDto } from '../dto/request/assign-work-pattern.dto.js';
import { BulkNonWorkingDaysDto } from '../dto/request/bulk-non-working-days.dto.js';
import { NonWorkingDayQueryDto } from '../dto/request/non-working-day-query.dto.js';

/** Normalised to midnight so a date matches the unique index on `date`. */
function dateOnly(value: string): Date {
  const parsed = new Date(value);
  return new Date(
    Date.UTC(
      parsed.getUTCFullYear(),
      parsed.getUTCMonth(),
      parsed.getUTCDate(),
    ),
  );
}

@Injectable()
export class GetNonWorkingDaysUseCase {
  constructor(private readonly repository: IWorkPatternRepository) {}

  async execute(query: NonWorkingDayQueryDto): Promise<NonWorkingDayEntity[]> {
    return this.repository.findNonWorkingDays({
      ...(query.from && { from: dateOnly(query.from) }),
      ...(query.to && { to: dateOnly(query.to) }),
    });
  }
}

@Injectable()
export class BulkUpsertNonWorkingDaysUseCase {
  constructor(private readonly repository: IWorkPatternRepository) {}

  /**
   * Takes explicit dates and reads **nothing** from `academic/`.
   *
   * The operator's browser fetches the academic calendar, previews which dates
   * would become non-working, and posts them here. That keeps the domain graph
   * one-way — `academic/` already depends on `presence/`, so a call back the
   * other way would close a cycle (research R9) — and it means nobody changes
   * what counts as a working day without seeing the list first.
   */
  async execute(
    dto: BulkNonWorkingDaysDto,
  ): Promise<{ imported: number; skipped: number }> {
    return this.repository.bulkUpsertNonWorkingDays(
      dto.days.map((day) => ({
        date: dateOnly(day.date),
        name: day.name,
        sourceCalendarId: day.sourceCalendarId ?? null,
      })),
    );
  }
}

@Injectable()
export class UpdateNonWorkingDayUseCase {
  constructor(private readonly repository: IWorkPatternRepository) {}

  async execute(id: string, name: string): Promise<NonWorkingDayEntity> {
    await this.assertExists(id);
    return this.repository.updateNonWorkingDay(id, name);
  }

  private async assertExists(id: string): Promise<void> {
    const days = await this.repository.findNonWorkingDays({});
    if (!days.some((day) => day.id === id)) {
      throw new NotFoundException('Non-working day not found');
    }
  }
}

@Injectable()
export class DeleteNonWorkingDayUseCase {
  constructor(private readonly repository: IWorkPatternRepository) {}

  async execute(id: string): Promise<void> {
    const days = await this.repository.findNonWorkingDays({});
    if (!days.some((day) => day.id === id)) {
      throw new NotFoundException('Non-working day not found');
    }

    await this.repository.deleteNonWorkingDay(id);
  }
}

@Injectable()
export class GetWorkPatternAssignmentsUseCase {
  constructor(private readonly repository: IWorkPatternRepository) {}

  async execute(userId?: string): Promise<WorkPatternAssignmentWithDetails[]> {
    return this.repository.findAssignments(userId);
  }
}

@Injectable()
export class AssignWorkPatternUseCase {
  constructor(private readonly repository: IWorkPatternRepository) {}

  async execute(
    dto: AssignWorkPatternDto,
  ): Promise<WorkPatternAssignmentWithDetails> {
    if (!(await this.repository.findById(dto.workPatternId))) {
      throw new NotFoundException('Work pattern not found');
    }

    return this.repository.assign({
      userId: dto.userId,
      workPatternId: dto.workPatternId,
      effectiveFrom: dateOnly(dto.effectiveFrom),
    });
  }
}
