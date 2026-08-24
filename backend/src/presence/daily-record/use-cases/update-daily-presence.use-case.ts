import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IAttendancePeriodRepository } from '../../attendance-period/domain/interfaces/attendance-period-repository.interface.js';
import { DailyPresenceEntity } from '../domain/entities/daily-presence.entity.js';
import { CorrectableField } from '../domain/entities/presence-correction.entity.js';
import {
  CorrectPresenceInput,
  IDailyPresenceRepository,
} from '../domain/interfaces/daily-presence-repository.interface.js';
import {
  IPresenceCorrectionRepository,
  RecordCorrectionInput,
} from '../domain/interfaces/presence-correction-repository.interface.js';
import { UpdateDailyPresenceDto } from '../dto/request/update-daily-presence.dto.js';
import { PresenceAuditService } from '../services/presence-audit.service.js';

function serialise(value: Date | string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  return value instanceof Date ? value.toISOString() : value;
}

@Injectable()
export class UpdateDailyPresenceUseCase {
  constructor(
    private readonly dailyPresence: IDailyPresenceRepository,
    private readonly corrections: IPresenceCorrectionRepository,
    private readonly periods: IAttendancePeriodRepository,
    private readonly audit: PresenceAuditService,
  ) {}

  /**
   * The most constrained write in the feature, and every constraint earns its
   * place:
   *
   * - a reason is required, because a correction with no reason is
   *   distinguishable from tampering only by trust (FR-013);
   * - nobody edits their own record, whatever permissions they hold — a
   *   permission cannot express "anyone but yourself" (FR-015);
   * - a closed period is refused, because closing is what fixes payroll's
   *   inputs and a late edit would move money that has already been approved.
   */
  async execute(
    id: string,
    dto: UpdateDailyPresenceDto,
    actorId: string,
  ): Promise<DailyPresenceEntity> {
    const existing = await this.dailyPresence.findById(id);
    if (!existing) {
      throw new NotFoundException('Attendance record not found');
    }

    if (existing.userId === actorId) {
      throw new ForbiddenException(
        'You cannot change your own attendance record',
      );
    }

    const date = new Date(existing.date);
    if (
      await this.periods.isClosed(date.getUTCFullYear(), date.getUTCMonth() + 1)
    ) {
      throw new ConflictException(
        'This month is closed. Reopen the period or issue the change as an adjustment.',
      );
    }

    const changes = this.diff(existing, dto);
    if (changes.length === 0) {
      throw new BadRequestException('Nothing to change');
    }

    const updated = await this.dailyPresence.correct(id, this.toInput(dto));

    await this.corrections.recordMany(
      changes.map((change): RecordCorrectionInput => ({
        dailyPresenceId: id,
        field: change.field,
        previousValue: change.previous,
        newValue: change.next,
        reason: dto.reason,
        actorId,
      })),
    );

    await this.audit.record('presence-record.correct', id, actorId, {
      subjectUserId: existing.userId,
      date: date.toISOString().slice(0, 10),
      reason: dto.reason,
    });

    return updated;
  }

  /** One correction row per field that actually moved — not per field sent. */
  private diff(
    existing: DailyPresenceEntity,
    dto: UpdateDailyPresenceDto,
  ): {
    field: CorrectableField;
    previous: string | null;
    next: string | null;
  }[] {
    const candidates: {
      field: CorrectableField;
      previous: string | null;
      next: string | null;
      sent: boolean;
    }[] = [
      {
        field: 'checkInAt',
        previous: serialise(existing.checkInAt),
        next: serialise(dto.checkInAt),
        sent: dto.checkInAt !== undefined,
      },
      {
        field: 'checkOutAt',
        previous: serialise(existing.checkOutAt),
        next: serialise(dto.checkOutAt),
        sent: dto.checkOutAt !== undefined,
      },
      {
        field: 'status',
        previous: existing.status,
        next: dto.status ?? null,
        sent: dto.status !== undefined,
      },
      {
        field: 'note',
        previous: existing.note ?? null,
        next: dto.note ?? null,
        sent: dto.note !== undefined,
      },
    ];

    return candidates
      .filter((c) => c.sent && c.previous !== c.next)
      .map(({ field, previous, next }) => ({ field, previous, next }));
  }

  private toInput(dto: UpdateDailyPresenceDto): CorrectPresenceInput {
    return {
      ...(dto.checkInAt !== undefined && {
        checkInAt: dto.checkInAt ? new Date(dto.checkInAt) : null,
      }),
      ...(dto.checkOutAt !== undefined && {
        checkOutAt: dto.checkOutAt ? new Date(dto.checkOutAt) : null,
      }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.note !== undefined && { note: dto.note }),
    };
  }
}
