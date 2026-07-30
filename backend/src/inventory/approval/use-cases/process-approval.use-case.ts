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
  constructor(private readonly repository: IApprovalRepository) {}

  async execute(instanceId: string, dto: ApproveActionDto, userId: string) {
    // 1. Find the approval instance
    const instance = await this.repository.findInstanceById(instanceId);
    if (!instance) {
      throw new NotFoundException('Approval instance not found.');
    }

    const pendingStatus =
      await this.repository.findStatusBySystemKey('LOAN_PENDING');
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
    const roleCodes = await this.repository.findUserRoleCodes(userId);

    // 3. Find active step
    const activeStep = instance.workflow.steps.find(
      (s) => s.stepSequence === instance.currentStepSequence,
    );
    if (!activeStep) {
      throw new BadRequestException(
        'Current approval step sequence is invalid.',
      );
    }

    // 4. Validate user is authorized for the active step
    const isAuthorized =
      roleCodes.includes(activeStep.approverRoleId) ||
      roleCodes.includes('SUPER_ADMIN');
    if (!isAuthorized) {
      throw new ForbiddenException(
        `You do not have the required role (${activeStep.approverRoleId}) to process this step.`,
      );
    }

    const nextStep = instance.workflow.steps.find(
      (s) => s.stepSequence === instance.currentStepSequence + 1,
    );

    // 5. Execute process in a database transaction inside the repository
    return this.repository.processApprovalTransaction({
      instanceId,
      referenceId: instance.referenceId,
      currentStepSequence: instance.currentStepSequence,
      action: dto.action,
      userId,
      note: dto.note,
      pendingStatusId: pendingStatus.id,
      hasNextStep: !!nextStep,
      nextStepSequence: nextStep?.stepSequence,
    });
  }
}
