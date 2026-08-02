import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IApprovalRepository } from '../domain/interfaces/approval-repository.interface.js';
import { ApproveActionDto } from '../dto/request/approve-action.dto.js';

@Injectable()
export class ProcessApprovalUseCase {
  constructor(private readonly approvalRepository: IApprovalRepository) {}

  async execute(instanceId: string, dto: ApproveActionDto, userId: string) {
    // 1. Find the approval instance
    const instance = await this.approvalRepository.findInstanceById(instanceId);
    if (!instance) {
      throw new NotFoundException('Approval instance not found.');
    }

    const pendingStatus =
      await this.approvalRepository.findStatusBySystemKey('LOAN_PENDING');
    if (!pendingStatus) {
      throw new BadRequestException(
        'This approval request is no longer pending.',
      );
    }
    if (instance.statusId !== pendingStatus.id) {
      throw new BadRequestException(
        'This approval request is no longer pending.',
      );
    }

    // 2. Resolve user roles
    const roleCodes = await this.approvalRepository.findUserRoleCodes(userId);

    const steps = instance.workflow?.steps ?? [];
    const currentSeq = instance.currentStepSequence ?? 1;

    // 3. Find active step
    const activeStep = steps.find((s) => s.stepSequence === currentSeq);
    if (!activeStep) {
      throw new BadRequestException(
        'Current approval step sequence is invalid.',
      );
    }

    const approverRoleId = String(activeStep.approverRoleId ?? '');
    const isAuthorized =
      roleCodes.includes(approverRoleId) || roleCodes.includes('SUPER_ADMIN');
    if (!isAuthorized) {
      throw new ForbiddenException(
        `You do not have the required role (${approverRoleId}) to process this step.`,
      );
    }

    const nextStep = steps.find((s) => s.stepSequence === currentSeq + 1);

    // 5. Execute process in a database transaction inside the repository
    return this.approvalRepository.processApprovalTransaction({
      instanceId,
      referenceId: instance.referenceId,
      currentStepSequence: currentSeq,
      action: dto.action,
      userId,
      note: dto.note,
      pendingStatusId: pendingStatus.id,
      hasNextStep: !!nextStep,
      nextStepSequence: nextStep?.stepSequence,
    });
  }
}
