import { Injectable } from '@nestjs/common';
import { IApprovalRepository } from '../domain/interfaces/approval-repository.interface.js';
import { CreateWorkflowDto } from '../dto/request/create-workflow.dto.js';

@Injectable()
export class CreateWorkflowUseCase {
  constructor(private readonly approvalRepository: IApprovalRepository) {}

  async execute(dto: CreateWorkflowDto) {
    return this.approvalRepository.createWorkflow({
      name: dto.name,
      targetEntity: dto.targetEntity,
      description: dto.description ?? null,
      isActive: true,
      steps: dto.steps.map((step) => ({
        stepSequence: step.stepSequence,
        approverRoleId: step.approverRoleId,
        isMandatory: step.isMandatory ?? true,
      })),
    });
  }
}
