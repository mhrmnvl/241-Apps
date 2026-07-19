import { Injectable } from '@nestjs/common';
import { IApprovalRepository } from '../domain/interfaces/approval-repository.interface.js';
import { CreateWorkflowDto } from '../dto/create-workflow.dto.js';

@Injectable()
export class CreateWorkflowUseCase {
  constructor(private readonly repository: IApprovalRepository) {}

  async execute(dto: CreateWorkflowDto) {
    return this.repository.createWorkflow({
      name: dto.name,
      targetEntity: dto.targetEntity,
      description: dto.description ?? null,
      isActive: true,
      steps: {
        create: dto.steps.map((step) => ({
          stepSequence: step.stepSequence,
          approverRoleId: step.approverRoleId,
          isMandatory: step.isMandatory ?? true,
        })),
      },
    });
  }
}
