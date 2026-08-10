import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ICredentialRepository } from '../../credential/domain/interfaces/credential-repository.interface.js';
import { LeaveRequestWithDetails } from '../domain/entities/leave.entity.js';
import { ILeaveRepository } from '../domain/interfaces/leave-repository.interface.js';
import { DecideLeaveRequestDto } from '../dto/request/decide-leave-request.dto.js';

@Injectable()
export class ApproveLeaveRequestUseCase {
  constructor(
    private readonly leave: ILeaveRepository,
    private readonly credentials: ICredentialRepository,
  ) {}

  async execute(
    id: string,
    approverId: string,
  ): Promise<LeaveRequestWithDetails> {
    const request = await this.leave.findRequestById(id);
    if (!request) {
      throw new NotFoundException('Leave request not found');
    }

    if (request.status !== 'PENDING') {
      throw new ConflictException(
        `This request is already ${request.status.toLowerCase()}.`,
      );
    }

    // FR-029. Nobody approves their own leave, whatever permissions they hold —
    // including the Kepala Sekolah, whose own leave needs somebody else.
    if (request.requesterId === approverId) {
      throw new ForbiddenException(
        'You cannot approve your own leave request.',
      );
    }

    const type = await this.leave.findTypeById(request.leaveTypeId);
    if (!type) {
      throw new NotFoundException('Leave type no longer exists');
    }

    if (type.consumesQuota) {
      await this.assertQuota(request, type.annualQuota ?? 0, type.name);
    }

    // The credential says whether this person is a student or an employee,
    // which is what the created presence rows need. Presence never asks
    // `academic/` who anyone is (ADR-0007).
    const credential = await this.credentials.findActiveByUserId(
      request.requesterId,
    );

    return this.leave.approve(
      id,
      { approverId, decidedAt: new Date() },
      type.treatment,
      credential?.subjectType ?? 'EMPLOYEE',
    );
  }

  /** FR-032: the shortfall is stated, not just the refusal. */
  private async assertQuota(
    request: LeaveRequestWithDetails,
    quota: number,
    typeName: string,
  ): Promise<void> {
    const year = request.startDate.getUTCFullYear();
    const used = await this.leave.countUsedDays(
      request.requesterId,
      request.leaveTypeId,
      year,
    );

    const remaining = quota - used;
    if (request.workingDayCount > remaining) {
      throw new UnprocessableEntityException(
        `${typeName}: ${remaining} day(s) remaining of ${quota}, but this request needs ${request.workingDayCount}. Short by ${request.workingDayCount - remaining}.`,
      );
    }
  }
}

@Injectable()
export class RejectLeaveRequestUseCase {
  constructor(private readonly leave: ILeaveRepository) {}

  async execute(
    id: string,
    dto: DecideLeaveRequestDto,
    approverId: string,
  ): Promise<LeaveRequestWithDetails> {
    const request = await this.leave.findRequestById(id);
    if (!request) {
      throw new NotFoundException('Leave request not found');
    }

    if (request.status !== 'PENDING') {
      throw new ConflictException(
        `This request is already ${request.status.toLowerCase()}.`,
      );
    }

    if (request.requesterId === approverId) {
      throw new ForbiddenException('You cannot decide your own leave request.');
    }

    return this.leave.reject(id, {
      approverId,
      decidedAt: new Date(),
      decisionReason: dto.reason,
    });
  }
}

@Injectable()
export class WithdrawLeaveRequestUseCase {
  constructor(private readonly leave: ILeaveRepository) {}

  /** Withdrawing consumes no quota, because nothing was ever approved. */
  async execute(
    id: string,
    requesterId: string,
  ): Promise<LeaveRequestWithDetails> {
    const request = await this.leave.findRequestById(id);
    if (!request) {
      throw new NotFoundException('Leave request not found');
    }

    if (request.requesterId !== requesterId) {
      throw new ForbiddenException('You can only withdraw your own request.');
    }

    if (request.status !== 'PENDING') {
      throw new ConflictException(
        'Only a pending request can be withdrawn. Ask an approver to reverse a decided one.',
      );
    }

    return this.leave.withdraw(id);
  }
}
