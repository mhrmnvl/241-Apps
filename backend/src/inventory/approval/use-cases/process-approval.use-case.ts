import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IApprovalRepository } from '../domain/interfaces/approval-repository.interface.js';
import { ApproveActionDto } from '../dto/request/approve-action.dto.js';
import { PrismaService } from '../../../core/database/prisma.service.js';

const ACTION_APPROVE = '00000000-0000-0000-0000-000000000001';
const ACTION_REJECT = '00000000-0000-0000-0000-000000000002';

@Injectable()
export class ProcessApprovalUseCase {
  constructor(
    private readonly repository: IApprovalRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(instanceId: string, dto: ApproveActionDto, userId: string) {
    // 1. Find the approval instance
    const instance = await this.repository.findInstanceById(instanceId);
    if (!instance) {
      throw new NotFoundException('Approval instance not found.');
    }

    const pendingStatus = await this.prisma.inventoryStatus.findUnique({
      where: { systemKey: 'LOAN_PENDING' },
    });
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
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: { role: true },
    });
    const roleCodes = userRoles.map((ur) => ur.role.code);

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

    // 5. Execute process in a database transaction
    return this.prisma.$transaction(async (tx) => {
      const log = await tx.approvalLog.create({
        data: {
          instanceId,
          stepSequence: instance.currentStepSequence,
          approverId: userId,
          actionId: dto.action === 'APPROVE' ? ACTION_APPROVE : ACTION_REJECT,
          note: dto.note ?? null,
        },
      });

      if (dto.action === 'REJECT') {
        // --- PROCESS REJECTION ---
        const rejectedStatus = await tx.inventoryStatus.findUnique({
          where: { systemKey: 'LOAN_REJECTED' },
        });
        const availStatus = await tx.inventoryStatus.findUnique({
          where: { systemKey: 'AVAILABLE' },
        });
        if (!rejectedStatus || !availStatus) {
          throw new NotFoundException(
            'Peran status "Pinjam Ditolak"/"Tersedia" belum diatur di Referensi > Status Aset.',
          );
        }

        // Update instance to REJECTED
        await tx.approvalInstance.update({
          where: { id: instanceId },
          data: { statusId: rejectedStatus.id },
        });

        // Update loan status to REJECTED
        await tx.inventoryLoan.update({
          where: { id: instance.referenceId },
          data: { statusId: rejectedStatus.id },
        });

        // Revert units to the "available" status
        const loanItems = await tx.inventoryLoanItem.findMany({
          where: { loanId: instance.referenceId },
        });
        const unitIds = loanItems.map((item) => item.unitId);
        await tx.inventoryAssetUnit.updateMany({
          where: { id: { in: unitIds } },
          data: { statusId: availStatus.id },
        });

        return { success: true, action: 'REJECT', log };
      } else {
        // --- PROCESS APPROVAL ---
        const nextStep = instance.workflow.steps.find(
          (s) => s.stepSequence === instance.currentStepSequence + 1,
        );

        if (nextStep) {
          // Move to next step sequence
          await tx.approvalInstance.update({
            where: { id: instanceId },
            data: { currentStepSequence: nextStep.stepSequence },
          });

          return {
            success: true,
            action: 'APPROVE_STEP',
            nextStepSequence: nextStep.stepSequence,
            log,
          };
        } else {
          // Final step approved -> COMPLETE workflow
          const approvedStatus = await tx.inventoryStatus.findUnique({
            where: { systemKey: 'LOAN_APPROVED' },
          });
          const loanedStatus = await tx.inventoryStatus.findUnique({
            where: { systemKey: 'LOANED' },
          });
          const txType = await tx.inventoryTransactionType.findUnique({
            where: { code: 'TX-LOAN-OUT' },
          });

          if (!approvedStatus || !loanedStatus || !txType) {
            throw new NotFoundException(
              'Peran status "Pinjam Disetujui"/"Dipinjam" belum diatur, atau tipe transaksi TX-LOAN-OUT belum tersedia.',
            );
          }

          // Complete instance status
          await tx.approvalInstance.update({
            where: { id: instanceId },
            data: { statusId: approvedStatus.id },
          });

          // Set loan to APPROVED
          const loan = await tx.inventoryLoan.update({
            where: { id: instance.referenceId },
            data: { statusId: approvedStatus.id },
          });

          // Move units from "loan pending" to "loaned"
          const loanItems = await tx.inventoryLoanItem.findMany({
            where: { loanId: instance.referenceId },
          });
          const unitIds = loanItems.map((item) => item.unitId);
          await tx.inventoryAssetUnit.updateMany({
            where: { id: { in: unitIds } },
            data: { statusId: loanedStatus.id },
          });

          // Write histories for each unit
          for (const unitId of unitIds) {
            await tx.inventoryHistory.create({
              data: {
                unitId,
                transactionTypeId: txType.id,
                previousStatusId: pendingStatus.id,
                newStatusId: loanedStatus.id,
                note: `Peminjaman disetujui penuh oleh Kepala Sekolah (No. Peminjaman: ${loan.loanNumber})`,
                changedById: userId,
              },
            });
          }

          return { success: true, action: 'APPROVE_FINAL', log };
        }
      }
    });
  }
}
