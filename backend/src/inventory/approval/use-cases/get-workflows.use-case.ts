import { Injectable } from '@nestjs/common';
import { IApprovalRepository } from '../domain/interfaces/approval-repository.interface.js';

@Injectable()
export class GetWorkflowsUseCase {
  constructor(private readonly approvalRepository: IApprovalRepository) {}

  async execute() {
    return this.approvalRepository.findAllWorkflows();
  }
}
