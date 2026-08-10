import { ConflictException, Injectable } from '@nestjs/common';
import { IAttendancePeriodRepository } from '../../attendance-period/domain/interfaces/attendance-period-repository.interface.js';
import { IWorkPatternRepository } from '../../work-pattern/domain/interfaces/work-pattern-repository.interface.js';
import { DailyPresenceEntity } from '../domain/entities/daily-presence.entity.js';
import { IDailyPresenceRepository } from '../domain/interfaces/daily-presence-repository.interface.js';
import { CreateDailyPresenceDto } from '../dto/request/create-daily-presence.dto.js';
import { PresenceAuditService } from '../services/presence-audit.service.js';

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
export class CreateDailyPresenceUseCase {
  constructor(
    private readonly dailyPresence: IDailyPresenceRepository,
    private readonly workPatterns: IWorkPatternRepository,
    private readonly periods: IAttendancePeriodRepository,
    private readonly audit: PresenceAuditService,
  ) {}

  /**
   * The path for somebody who never scanned — forgot their card, the gate was
   * down, they were on official duty elsewhere.
   *
   * Everything it writes is stamped `MANUAL`, so the recap can always tell a
   * day the gate observed from a day a person asserted (FR-014).
   */
  async execute(
    dto: CreateDailyPresenceDto,
    actorId: string,
  ): Promise<DailyPresenceEntity> {
    const date = dateOnly(dto.date);

    if (
      await this.periods.isClosed(date.getUTCFullYear(), date.getUTCMonth() + 1)
    ) {
      throw new ConflictException(
        'This month is closed and can no longer be edited.',
      );
    }

    const existing = await this.dailyPresence.findByUserAndDate(
      dto.userId,
      date,
    );
    if (existing) {
      throw new ConflictException(
        'This person already has a record for that date. Correct it instead.',
      );
    }

    const pattern = await this.workPatterns.resolveForUserAndDate(
      dto.userId,
      date,
    );

    const record = await this.dailyPresence.createManual({
      userId: dto.userId,
      subjectType: dto.subjectType,
      date,
      status: dto.status,
      checkInAt: dto.checkInAt ? new Date(dto.checkInAt) : null,
      checkOutAt: dto.checkOutAt ? new Date(dto.checkOutAt) : null,
      // A manual entry asserts the outcome directly; it is not re-derived from
      // the clock, because the person entering it knows something the gate does
      // not.
      lateMinutes: 0,
      workPatternId: pattern.workPatternId,
      note: dto.note ?? null,
    });

    await this.audit.record('presence-record.create', record.id, actorId, {
      subjectUserId: dto.userId,
      date: date.toISOString().slice(0, 10),
      reason: dto.reason,
    });

    return record;
  }
}
