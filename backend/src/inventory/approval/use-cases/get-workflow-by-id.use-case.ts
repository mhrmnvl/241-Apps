import { Injectable, NotFoundException } from '@nestjs/common';
import { IApprovalRepository } from '../domain/interfaces/approval-repository.interface.js';

@Injectable()
export class GetWorkflowByIdUseCase {
  constructor(private readonly approvalRepository: IApprovalRepository) {}

  async execute(id: string) {
    const workflow = await this.approvalRepository.findWorkflowById(id);
    if (!workflow) {
      throw new NotFoundException('Workflow template not found.');
    }
    return workflow;
  }
}
