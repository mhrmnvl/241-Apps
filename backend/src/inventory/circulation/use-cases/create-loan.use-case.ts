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
      await this.repository.findStatusBySystemKey('LOAN_PENDING');

    if (!pendingStatus) {
      throw new NotFoundException(
        'Peran status "Menunggu Persetujuan" belum diatur di Referensi > Status Aset.',
      );
    }

    // 1. Verify units exist and are available
    const units = await this.prisma.inventoryAssetUnit.findMany({
      where: {
        id: { in: dto.unitIds },
        deletedAt: null,
      },
      include: { asset: true, status: true },
    });

    if (units.length !== dto.unitIds.length) {
      throw new BadRequestException('One or more units do not exist.');
    }

    for (const unit of units) {
      if (!unit.status?.allowTransactions) {
        throw new BadRequestException(
          `Unit "${unit.asset.name}" (${unit.unitNumber}) is not available for borrowing.`,
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
            create: dto.unitIds.map((unitId) => ({
              unitId,
            })),
          },
        },
      });

      // Update unit statuses to "loan pending"
      await tx.inventoryAssetUnit.updateMany({
        where: { id: { in: dto.unitIds } },
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
                unit: true,
              },
            },
          },
        });
      } else {
        // Auto-approve if no active workflow
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

        // Update loan status to approved
        const approvedLoan = await tx.inventoryLoan.update({
          where: { id: loan.id },
          data: { statusId: approvedStatus.id },
        });

        // Update units to "loaned"
        await tx.inventoryAssetUnit.updateMany({
          where: { id: { in: dto.unitIds } },
          data: { statusId: loanedStatus.id },
        });

        // Create histories
        for (const unit of units) {
          await tx.inventoryHistory.create({
            data: {
              unitId: unit.id,
              transactionTypeId: txType.id,
              previousStatusId: unit.statusId,
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
