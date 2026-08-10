import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { LeaveRequestWithDetails } from '../domain/entities/leave.entity.js';
import { ILeaveRepository } from '../domain/interfaces/leave-repository.interface.js';
import { SubmitLeaveRequestDto } from '../dto/request/submit-leave-request.dto.js';
import { WorkingDayExpanderService } from '../services/working-day-expander.service.js';

/** Midnight, so a date matches the one-row-per-person-per-day index. */
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
export class SubmitLeaveRequestUseCase {
  constructor(
    private readonly leave: ILeaveRepository,
    private readonly expander: WorkingDayExpanderService,
  ) {}

  async execute(
    dto: SubmitLeaveRequestDto,
    requesterId: string,
  ): Promise<LeaveRequestWithDetails> {
    const type = await this.leave.findTypeById(dto.leaveTypeId);
    if (!type?.isActive) {
      throw new NotFoundException('Leave type not found');
    }

    if (type.requiresDocument && !dto.documentFileId) {
      throw new UnprocessableEntityException(
        `${type.name} requires a supporting document.`,
      );
    }

    const start = dateOnly(dto.startDate);
    const end = dateOnly(dto.endDate);

    if (end < start) {
      throw new BadRequestException('The end date is before the start date.');
    }

    const days = await this.expander.expand(requesterId, start, end);
    if (days.length === 0) {
      throw new UnprocessableEntityException(
        'That range contains no working days — nothing would be recorded.',
      );
    }

    return this.leave.submit({
      requesterId,
      leaveTypeId: dto.leaveTypeId,
      startDate: start,
      endDate: end,
      reason: dto.reason,
      documentFileId: dto.documentFileId ?? null,
      // Only working days count, so a request spanning a weekend consumes less
      // quota than its calendar length suggests (FR-032).
      workingDayCount: days.length,
      days,
    });
  }
}
