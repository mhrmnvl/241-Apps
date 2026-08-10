import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  WorkPatternEntity,
  WorkPatternWithDays,
} from '../domain/entities/work-pattern.entity.js';
import { IWorkPatternRepository } from '../domain/interfaces/work-pattern-repository.interface.js';
import { CreateWorkPatternDto } from '../dto/request/create-work-pattern.dto.js';
import { ReplaceWorkPatternDaysDto } from '../dto/request/replace-work-pattern-days.dto.js';
import { UpdateWorkPatternDto } from '../dto/request/update-work-pattern.dto.js';

const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];

@Injectable()
export class GetWorkPatternsUseCase {
  constructor(private readonly repository: IWorkPatternRepository) {}

  async execute(): Promise<WorkPatternWithDays[]> {
    return this.repository.findAll();
  }
}

@Injectable()
export class CreateWorkPatternUseCase {
  constructor(private readonly repository: IWorkPatternRepository) {}

  async execute(dto: CreateWorkPatternDto): Promise<WorkPatternEntity> {
    // A second default would make "which pattern applies to someone with no
    // assignment" ambiguous, and the partial unique index would reject it
    // anyway — better a clear message than a constraint violation.
    if (dto.isDefault) {
      await this.assertNoOtherDefault();
    }

    return this.repository.create({
      name: dto.name,
      graceMinutes: dto.graceMinutes,
      isDefault: dto.isDefault ?? false,
    });
  }

  private async assertNoOtherDefault(excludeId?: string): Promise<void> {
    const patterns = await this.repository.findAll();
    const existing = patterns.find(
      (pattern) => pattern.isDefault && pattern.id !== excludeId,
    );

    if (existing) {
      throw new ConflictException(
        `"${existing.name}" is already the default pattern. Clear that first.`,
      );
    }
  }
}

@Injectable()
export class UpdateWorkPatternUseCase {
  constructor(private readonly repository: IWorkPatternRepository) {}

  /**
   * Editing a pattern does **not** recompute any day already recorded.
   * `DailyPresence.workPatternId` stores what each day was actually judged
   * against, so a closed period keeps the figures it was closed with (FR-027).
   */
  async execute(
    id: string,
    dto: UpdateWorkPatternDto,
  ): Promise<WorkPatternEntity> {
    await this.assertExists(id);

    if (dto.isDefault) {
      const patterns = await this.repository.findAll();
      const other = patterns.find(
        (pattern) => pattern.isDefault && pattern.id !== id,
      );
      if (other) {
        throw new ConflictException(
          `"${other.name}" is already the default pattern. Clear that first.`,
        );
      }
    }

    return this.repository.update(id, dto);
  }

  private async assertExists(id: string): Promise<void> {
    if (!(await this.repository.findById(id))) {
      throw new NotFoundException('Work pattern not found');
    }
  }
}

@Injectable()
export class DeleteWorkPatternUseCase {
  constructor(private readonly repository: IWorkPatternRepository) {}

  async execute(id: string): Promise<WorkPatternEntity> {
    const pattern = await this.repository.findById(id);
    if (!pattern) {
      throw new NotFoundException('Work pattern not found');
    }

    // Removing the default would leave everyone without an assignment judged
    // against nothing, and every scan would resolve to NOT_EXPECTED.
    if (pattern.isDefault) {
      throw new ConflictException(
        'The default pattern cannot be removed. Make another pattern the default first.',
      );
    }

    const assigned = await this.repository.countAssignments(id);
    if (assigned > 0) {
      throw new ConflictException(
        `${assigned} employee(s) are still assigned to this pattern.`,
      );
    }

    return this.repository.softDelete(id);
  }
}

@Injectable()
export class ReplaceWorkPatternDaysUseCase {
  constructor(private readonly repository: IWorkPatternRepository) {}

  /**
   * All seven weekdays at once, never a subset. A partial update could leave a
   * pattern with no Friday, which resolves to "not a working day" for everyone
   * assigned — a silent change to who counts as absent.
   */
  async execute(id: string, dto: ReplaceWorkPatternDaysDto) {
    if (!(await this.repository.findById(id))) {
      throw new NotFoundException('Work pattern not found');
    }

    const supplied = dto.days.map((day) => day.weekday).sort();
    const complete = WEEKDAYS.every((weekday) => supplied.includes(weekday));

    if (!complete || supplied.length !== WEEKDAYS.length) {
      throw new ConflictException(
        'Supply all seven weekdays exactly once — a partial update would silently change who counts as absent.',
      );
    }

    for (const day of dto.days) {
      if (day.isWorkingDay && day.endTime <= day.startTime) {
        throw new ConflictException(
          `Weekday ${day.weekday}: the end time must be after the start time.`,
        );
      }
    }

    return this.repository.replaceDays(id, dto.days);
  }
}
