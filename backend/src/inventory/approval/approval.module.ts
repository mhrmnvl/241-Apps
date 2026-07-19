import { Module } from '@nestjs/common';
import { PrismaApprovalRepository } from './infrastructure/persistence/prisma-approval.repository.js';
import { IApprovalRepository } from './domain/interfaces/approval-repository.interface.js';
import { CreateWorkflowUseCase } from './use-cases/create-workflow.use-case.js';
import { GetWorkflowsUseCase } from './use-cases/get-workflows.use-case.js';
import { GetWorkflowByIdUseCase } from './use-cases/get-workflow-by-id.use-case.js';
import { GetPendingApprovalsUseCase } from './use-cases/get-pending-approvals.use-case.js';
import { ProcessApprovalUseCase } from './use-cases/process-approval.use-case.js';
import { WorkflowController } from './presentation/workflow.controller.js';
import { ApprovalController } from './presentation/approval.controller.js';

@Module({
  controllers: [WorkflowController, ApprovalController],
  providers: [
    { provide: IApprovalRepository, useClass: PrismaApprovalRepository },
    CreateWorkflowUseCase,
    GetWorkflowsUseCase,
    GetWorkflowByIdUseCase,
    GetPendingApprovalsUseCase,
    ProcessApprovalUseCase,
  ],
  exports: [IApprovalRepository],
})
export class ApprovalModule {}
