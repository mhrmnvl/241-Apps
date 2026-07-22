import { Injectable } from '@nestjs/common';
import {
  ApprovalWorkflow,
  ApprovalInstance,
  ApprovalLog,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import {
  IApprovalRepository,
  ApprovalInstanceWithRelations,
} from '../../domain/interfaces/approval-repository.interface.js';

@Injectable()
export class PrismaApprovalRepository extends IApprovalRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAllWorkflows(): Promise<ApprovalWorkflow[]> {
    return this.prisma.approvalWorkflow.findMany({
      include: {
        steps: {
          orderBy: { stepSequence: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findWorkflowById(id: string): Promise<ApprovalWorkflow | null> {
    return this.prisma.approvalWorkflow.findUnique({
      where: { id },
      include: {
        steps: {
          orderBy: { stepSequence: 'asc' },
        },
      },
    });
  }

  async createWorkflow(
    data: Prisma.ApprovalWorkflowCreateInput,
  ): Promise<ApprovalWorkflow> {
    return this.prisma.approvalWorkflow.create({ data });
  }

  async findInstanceById(
    id: string,
  ): Promise<ApprovalInstanceWithRelations | null> {
    return this.prisma.approvalInstance.findUnique({
      where: { id },
      include: {
        workflow: {
          include: {
            steps: {
              orderBy: { stepSequence: 'asc' },
            },
          },
        },
        logs: true,
      },
    });
  }

  async updateInstance(
    id: string,
    data: Prisma.ApprovalInstanceUpdateInput,
  ): Promise<ApprovalInstance> {
    return this.prisma.approvalInstance.update({
      where: { id },
      data,
    });
  }

  async createLog(data: Prisma.ApprovalLogCreateInput): Promise<ApprovalLog> {
    return this.prisma.approvalLog.create({ data });
  }

  async findPendingInstancesForRoles(
    roleCodes: string[],
  ): Promise<ApprovalInstanceWithRelations[]> {
    const pendingStatus = await this.prisma.inventoryStatus.findUnique({
      where: { systemKey: 'LOAN_PENDING' },
    });
    if (!pendingStatus) return [];

    const instances = await this.prisma.approvalInstance.findMany({
      where: {
        statusId: pendingStatus.id,
      },
      include: {
        workflow: {
          include: {
            steps: {
              orderBy: { stepSequence: 'asc' },
            },
          },
        },
        logs: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return instances.filter((inst) => {
      const activeStep = inst.workflow.steps.find(
        (s) => s.stepSequence === inst.currentStepSequence,
      );
      return activeStep && roleCodes.includes(activeStep.approverRoleId);
    });
  }
}
