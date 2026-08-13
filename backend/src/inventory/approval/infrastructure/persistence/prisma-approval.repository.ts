import { Injectable } from '@nestjs/common';
import {
  ApprovalWorkflow,
  ApprovalInstance,
  ApprovalLog,
  InventoryStatusKey,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { InventoryReferenceDataMissingException } from '../../../shared/domain/exceptions/inventory-reference-data-missing.exception.js';
import {
  CreateApprovalLogInput,
  CreateApprovalWorkflowInput,
  IApprovalRepository,
  ProcessApprovalResult,
  ProcessApprovalTransactionInput,
  UpdateApprovalInstanceInput,
  type ApprovalLoanDetailRow,
} from '../../domain/interfaces/approval-repository.interface.js';
import { ApprovalInstanceWithRelations } from './prisma-approval.includes.js';

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
    input: CreateApprovalWorkflowInput,
  ): Promise<ApprovalWorkflow> {
    const { steps, ...scalars } = input;

    const data: Prisma.ApprovalWorkflowCreateInput = {
      ...scalars,
      steps: {
        create: steps.map((step) => ({
          stepSequence: step.stepSequence,
          approverRoleId: step.approverRoleId,
          isMandatory: step.isMandatory ?? true,
        })),
      },
    };

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
    data: UpdateApprovalInstanceInput,
  ): Promise<ApprovalInstance> {
    return this.prisma.approvalInstance.update({
      where: { id },
      data,
    });
  }

  async createLog(data: CreateApprovalLogInput): Promise<ApprovalLog> {
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

  async findUserRoleCodes(userId: string): Promise<string[]> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: { role: true },
    });
    return userRoles.map((ur) => ur.role.code);
  }

  async findStatusBySystemKey(
    key: InventoryStatusKey,
  ): Promise<{ id: string } | null> {
    return this.prisma.inventoryStatus.findUnique({
      where: { systemKey: key },
      select: { id: true },
    });
  }

  async processApprovalTransaction(
    params: ProcessApprovalTransactionInput,
  ): Promise<ProcessApprovalResult> {
    const ACTION_APPROVE = '00000000-0000-0000-0000-000000000001';
    const ACTION_REJECT = '00000000-0000-0000-0000-000000000002';

    return this.prisma.$transaction(async (tx) => {
      const log = await tx.approvalLog.create({
        data: {
          instanceId: params.instanceId,
          stepSequence: params.currentStepSequence,
          approverId: params.userId,
          actionId:
            params.action === 'APPROVE' ? ACTION_APPROVE : ACTION_REJECT,
          note: params.note ?? null,
        },
      });

      if (params.action === 'REJECT') {
        const rejectedStatus = await tx.inventoryStatus.findUnique({
          where: { systemKey: 'LOAN_REJECTED' },
        });
        const availStatus = await tx.inventoryStatus.findUnique({
          where: { systemKey: 'AVAILABLE' },
        });
        const cancelType = await tx.inventoryTransactionType.findUnique({
          where: { code: 'TX-LOAN-CANCEL' },
        });

        const missing: string[] = [];
        if (!rejectedStatus) missing.push('status role LOAN_REJECTED');
        if (!availStatus) missing.push('status role AVAILABLE');
        if (!cancelType) missing.push('transaction type TX-LOAN-CANCEL');
        if (!rejectedStatus || !availStatus || !cancelType) {
          throw new InventoryReferenceDataMissingException(missing);
        }

        await tx.approvalInstance.update({
          where: { id: params.instanceId },
          data: { statusId: rejectedStatus.id },
        });

        await tx.inventoryLoan.update({
          where: { id: params.referenceId },
          data: { statusId: rejectedStatus.id },
        });

        const loanItems = await tx.inventoryLoanItem.findMany({
          where: { loanId: params.referenceId },
        });
        const unitIds = loanItems.map((item) => item.unitId);
        await tx.inventoryAssetUnit.updateMany({
          where: { id: { in: unitIds } },
          data: { statusId: availStatus.id },
        });

        for (const unitId of unitIds) {
          await tx.inventoryHistory.create({
            data: {
              unitId,
              transactionTypeId: cancelType.id,
              previousStatusId: params.pendingStatusId,
              newStatusId: availStatus.id,
              note: `Peminjaman ditolak (${params.note ?? 'Tanpa catatan'})`,
              changedById: params.userId,
            },
          });
        }

        return { success: true, action: 'REJECT', log };
      } else {
        if (params.hasNextStep && params.nextStepSequence !== undefined) {
          await tx.approvalInstance.update({
            where: { id: params.instanceId },
            data: { currentStepSequence: params.nextStepSequence },
          });

          return {
            success: true,
            action: 'APPROVE_STEP',
            nextStepSequence: params.nextStepSequence,
            log,
          };
        } else {
          const approvedStatus = await tx.inventoryStatus.findUnique({
            where: { systemKey: 'LOAN_APPROVED' },
          });
          const loanedStatus = await tx.inventoryStatus.findUnique({
            where: { systemKey: 'LOANED' },
          });
          const txType = await tx.inventoryTransactionType.findUnique({
            where: { code: 'TX-LOAN-OUT' },
          });

          const missing: string[] = [];
          if (!approvedStatus) missing.push('status role LOAN_APPROVED');
          if (!loanedStatus) missing.push('status role LOANED');
          if (!txType) missing.push('transaction type TX-LOAN-OUT');
          if (!approvedStatus || !loanedStatus || !txType) {
            throw new InventoryReferenceDataMissingException(missing);
          }

          await tx.approvalInstance.update({
            where: { id: params.instanceId },
            data: { statusId: approvedStatus.id },
          });

          const loan = await tx.inventoryLoan.update({
            where: { id: params.referenceId },
            data: { statusId: approvedStatus.id },
          });

          const loanItems = await tx.inventoryLoanItem.findMany({
            where: { loanId: params.referenceId },
          });
          const unitIds = loanItems.map((item) => item.unitId);
          await tx.inventoryAssetUnit.updateMany({
            where: { id: { in: unitIds } },
            data: { statusId: loanedStatus.id },
          });

          for (const unitId of unitIds) {
            await tx.inventoryHistory.create({
              data: {
                unitId,
                transactionTypeId: txType.id,
                previousStatusId: params.pendingStatusId,
                newStatusId: loanedStatus.id,
                note: `Peminjaman disetujui penuh oleh Kepala Sekolah (No. Peminjaman: ${loan.loanNumber})`,
                changedById: params.userId,
              },
            });
          }

          return { success: true, action: 'APPROVE_FINAL', log };
        }
      }
    });
  }

  async findLoanDetailsForInstance(
    referenceId: string,
  ): Promise<ApprovalLoanDetailRow | null> {
    return this.prisma.inventoryLoan.findUnique({
      where: { id: referenceId },
      include: {
        items: {
          include: {
            unit: { include: { asset: true } },
          },
        },
      },
    });
  }
}
