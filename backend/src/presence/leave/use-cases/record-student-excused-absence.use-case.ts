import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { LeaveRequestWithDetails } from '../domain/entities/leave.entity.js';
import { ILeaveRepository } from '../domain/interfaces/leave-repository.interface.js';
import { RecordStudentAbsenceDto } from '../dto/request/record-student-absence.dto.js';
import { WorkingDayExpanderService } from '../services/working-day-expander.service.js';

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
export class RecordStudentExcusedAbsenceUseCase {
  constructor(
    private readonly leave: ILeaveRepository,
    private readonly expander: WorkingDayExpanderService,
  ) {}

  /**
   * A wali kelas recording a parent's sick note (FR-035).
   *
   * Submitted and approved in one step, because the wali kelas *is* the
   * decision — asking them to file a request and then approve their own would
   * be ceremony, and FR-029's "no self-approval" guards an employee approving
   * their own leave, not a teacher recording a pupil's.
   *
   * The record is still a real `LeaveRequest`, so the day lands in
   * `DailyPresence` through exactly the same path as employee leave and the
   * recap counts it the same way. The teacher is stored as the approver, which
   * is what makes it attributable.
   */
  async execute(
    dto: RecordStudentAbsenceDto,
    recordedBy: string,
  ): Promise<LeaveRequestWithDetails> {
    const type = await this.leave.findTypeById(dto.leaveTypeId);
    if (!type?.isActive) {
      throw new NotFoundException('Leave type not found');
    }

    if (type.appliesTo !== 'STUDENT') {
      throw new UnprocessableEntityException(
        `${type.name} is not a student leave type.`,
      );
    }

    const start = dateOnly(dto.startDate);
    const end = dateOnly(dto.endDate ?? dto.startDate);

    const days = await this.expander.expand(dto.studentUserId, start, end);
    if (days.length === 0) {
      throw new UnprocessableEntityException(
        'That range contains no school days.',
      );
    }

    const request = await this.leave.submit({
      requesterId: dto.studentUserId,
      leaveTypeId: dto.leaveTypeId,
      startDate: start,
      endDate: end,
      reason: dto.reason,
      documentFileId: dto.documentFileId ?? null,
      workingDayCount: days.length,
      days,
    });

    return this.leave.approve(
      request.id,
      { approverId: recordedBy, decidedAt: new Date() },
      type.treatment,
      'STUDENT',
    );
  }
}
