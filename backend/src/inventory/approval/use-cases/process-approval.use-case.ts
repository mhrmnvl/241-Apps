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

    // Who approves this step is workflow configuration, not a name written into
    // the code: the school sets it when defining the workflow, and this compares
    // the caller's roles against what they set.
    //
    // The `|| roleCodes.includes('SUPER_ADMIN')` that used to sit here was a
    // different thing - a bypass copied out of PermissionGuard, which the
    // constitution forbids exactly because a second copy drifts from the first.
    // A super admin who genuinely needs to approve is named as the step's
    // approver, like anybody else.
    const approverRoleCode = String(activeStep.approverRoleCode ?? '');
    if (!roleCodes.includes(approverRoleCode)) {
      throw new ForbiddenException(
        `You do not have the required role (${approverRoleCode}) to process this step.`,
      );
    }

    const nextStep = steps.find((s) => s.stepSequence === currentSeq + 1);

    /**
     * Whether this approval finishes the loan or passes it on.
     *
     * A mandatory next step is always taken: the workflow says the loan needs
     * that signature and an approver cannot waive it. An optional one is the
     * approver's call - the inventory administrator decides, per loan, whether
     * it also needs the head teacher.
     *
     * Asking to forward when there is nobody to forward to is refused rather
     * than ignored. Ignoring it would leave the requester told their loan is
     * with an approver who does not exist, and waiting for a signature that can
     * never come.
     */
    if (dto.forwardToNextApprover && !nextStep) {
      throw new BadRequestException(
        'This workflow has no further approver to forward to.',
      );
    }

    const forwarding =
      dto.action === 'APPROVE' &&
      !!nextStep &&
      (nextStep.isMandatory || dto.forwardToNextApprover === true);

    return this.approvalRepository.processApprovalTransaction({
      instanceId,
      referenceId: instance.referenceId,
      currentStepSequence: currentSeq,
      action: dto.action,
      userId,
      note: dto.note,
      pendingStatusId: pendingStatus.id,
      hasNextStep: forwarding,
      nextStepSequence: forwarding ? nextStep?.stepSequence : undefined,
    });
  }
}
