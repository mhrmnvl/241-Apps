import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ICirculationRepository } from '../domain/interfaces/circulation-repository.interface.js';
import { CreateLoanDto } from '../dto/request/create-loan.dto.js';
import { PrismaService } from '../../../core/database/prisma.service.js';

@Injectable()
export class CreateLoanUseCase {
  constructor(
    private readonly repository: ICirculationRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(dto: CreateLoanDto, requesterId: string) {
    const pendingStatus =
      await this.repository.findStatusByCode('STAT-LOAN-PENDING');
    const availStatus = await this.repository.findStatusByCode('STAT-AVAIL');

    if (!pendingStatus || !availStatus) {
      throw new NotFoundException(
        'Inventory statuses not initialized. Run seeds.',
      );
    }

    // 1. Verify assets exist and are available
    const assets = await this.prisma.inventoryAsset.findMany({
      where: {
        id: { in: dto.assetIds },
        deletedAt: null,
      },
    });

    if (assets.length !== dto.assetIds.length) {
      throw new BadRequestException('One or more assets do not exist.');
    }

    for (const asset of assets) {
      if (asset.statusId !== availStatus.id) {
        throw new BadRequestException(
          `Asset "${asset.name}" (${asset.assetNumber}) is not available for borrowing.`,
        );
      }
    }

    // 2. Generate unique loan number
    const latestLoan = await this.repository.findLatestLoan();
    const todayStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    let nextSeq = 1;
    if (latestLoan?.loanNumber.startsWith(`LN-${todayStr}`)) {
      const parts = latestLoan.loanNumber.split('-');
      nextSeq = parseInt(parts[parts.length - 1] || '0') + 1;
    }
    const loanNumber = `LN-${todayStr}-${nextSeq.toString().padStart(4, '0')}`;

    // 3. Create Loan in a transaction
    return this.prisma.$transaction(async (tx) => {
      // Create the loan request
      const loan = await tx.inventoryLoan.create({
        data: {
          loanNumber,
          requesterId,
          expectedReturnDate: new Date(dto.expectedReturnDate),
          purpose: dto.purpose,
          statusId: pendingStatus.id,
          items: {
            create: dto.assetIds.map((assetId) => ({
              assetId,
            })),
          },
        },
      });

      // Update asset statuses to STAT-LOAN-PENDING
      await tx.inventoryAsset.updateMany({
        where: { id: { in: dto.assetIds } },
        data: { statusId: pendingStatus.id },
      });

      // 4. Trigger Approval Workflow if active
      const activeWorkflow = await tx.approvalWorkflow.findFirst({
        where: { targetEntity: 'InventoryLoan', isActive: true },
      });

      if (activeWorkflow) {
        const instance = await tx.approvalInstance.create({
          data: {
            workflowId: activeWorkflow.id,
            referenceId: loan.id,
            currentStepSequence: 1,
            statusId: pendingStatus.id,
          },
        });

        // Link instance to loan
        return tx.inventoryLoan.update({
          where: { id: loan.id },
          data: { workflowInstanceId: instance.id },
          include: {
            items: {
              include: {
                asset: true,
              },
            },
          },
        });
      } else {
        // Auto-approve if no active workflow
        const approvedStatus = await tx.inventoryStatus.findUnique({
          where: { code: 'STAT-LOAN-APPROVED' },
        });
        const loanedStatus = await tx.inventoryStatus.findUnique({
          where: { code: 'STAT-LOANED' },
        });
        const txType = await tx.inventoryTransactionType.findUnique({
          where: { code: 'TX-LOAN-OUT' },
        });

        if (!approvedStatus || !loanedStatus || !txType) {
          throw new NotFoundException(
            'Inventory statuses or transaction types not initialized.',
          );
        }

        // Update loan status to approved
        const approvedLoan = await tx.inventoryLoan.update({
          where: { id: loan.id },
          data: { statusId: approvedStatus.id },
        });

        // Update assets to STAT-LOANED
        await tx.inventoryAsset.updateMany({
          where: { id: { in: dto.assetIds } },
          data: { statusId: loanedStatus.id },
        });

        // Create histories
        for (const asset of assets) {
          await tx.inventoryHistory.create({
            data: {
              assetId: asset.id,
              transactionTypeId: txType.id,
              previousStatusId: asset.statusId,
              newStatusId: loanedStatus.id,
              note: `Peminjaman otomatis disetujui (No. ${loanNumber})`,
              changedById: requesterId,
            },
          });
        }

        return approvedLoan;
      }
    });
  }
}
