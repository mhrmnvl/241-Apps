import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ICirculationRepository } from '../domain/interfaces/circulation-repository.interface.js';
import { ReturnLoanDto } from '../dto/request/return-loan.dto.js';
import { PrismaService } from '../../../core/database/prisma.service.js';

@Injectable()
export class ReturnLoanUseCase {
  constructor(
    private readonly repository: ICirculationRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(id: string, dto: ReturnLoanDto, changedById: string) {
    const loan = await this.repository.findLoanById(id);
    if (!loan) {
      throw new NotFoundException('Loan transaction not found.');
    }

    const returnedStatus =
      await this.repository.findStatusByCode('STAT-LOAN-RETURNED');
    const availStatus = await this.repository.findStatusByCode('STAT-AVAIL');
    const txType =
      await this.repository.findTransactionTypeByCode('TX-LOAN-IN');

    if (!returnedStatus || !availStatus || !txType) {
      throw new NotFoundException(
        'Statuses or transaction types not initialized.',
      );
    }

    if (loan.actualReturnDate) {
      throw new BadRequestException(
        'This loan has already been fully returned.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Update loan transaction status
      const updatedLoan = await tx.inventoryLoan.update({
        where: { id },
        data: {
          actualReturnDate: new Date(),
          statusId: returnedStatus.id,
        },
      });

      // 2. Process each item being returned
      for (const itemDto of dto.items) {
        const loanItem = loan.items.find((i) => i.assetId === itemDto.assetId);
        if (!loanItem) {
          throw new BadRequestException(
            `Asset ID ${itemDto.assetId} is not part of this loan.`,
          );
        }

        const asset = loanItem.asset;

        // Update returned condition on the loan item
        await tx.inventoryLoanItem.update({
          where: { id: loanItem.id },
          data: {
            returnedConditionId: itemDto.returnedConditionId,
            notes: itemDto.notes ?? null,
          },
        });

        // Revert asset status to STAT-AVAIL and set new condition
        await tx.inventoryAsset.update({
          where: { id: asset.id },
          data: {
            statusId: availStatus.id,
            conditionId: itemDto.returnedConditionId,
          },
        });

        // Record history log
        await tx.inventoryHistory.create({
          data: {
            assetId: asset.id,
            transactionTypeId: txType.id,
            previousConditionId: asset.conditionId,
            newConditionId: itemDto.returnedConditionId,
            previousStatusId: asset.statusId,
            newStatusId: availStatus.id,
            note: `Pengembalian aset dari peminjaman (No. ${loan.loanNumber}). ${itemDto.notes ?? ''}`,
            changedById,
          },
        });
      }

      return updatedLoan;
    });
  }
}
