import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ICirculationRepository } from '../domain/interfaces/circulation-repository.interface.js';
import { ReturnLoanDto } from '../dto/request/return-loan.dto.js';

@Injectable()
export class ReturnLoanUseCase {
  constructor(private readonly repository: ICirculationRepository) {}

  async execute(id: string, dto: ReturnLoanDto, changedById: string) {
    const loan = await this.repository.findLoanById(id);
    if (!loan) {
      throw new NotFoundException('Loan transaction not found.');
    }

    const returnedStatus =
      await this.repository.findStatusBySystemKey('LOAN_RETURNED');
    const availStatus =
      await this.repository.findStatusBySystemKey('AVAILABLE');
    const txType =
      await this.repository.findTransactionTypeByCode('TX-LOAN-IN');

    if (!returnedStatus || !availStatus || !txType) {
      throw new NotFoundException(
        'Peran status "Baru Dikembalikan"/"Tersedia" belum diatur, atau tipe transaksi TX-LOAN-IN belum tersedia.',
      );
    }

    if (loan.actualReturnDate) {
      throw new BadRequestException(
        'This loan has already been fully returned.',
      );
    }

    for (const itemDto of dto.items) {
      const loanItem = loan.items.find((i) => i.unitId === itemDto.unitId);
      if (!loanItem) {
        throw new BadRequestException(
          `Unit ID ${itemDto.unitId} is not part of this loan.`,
        );
      }
    }

    return this.repository.processReturnLoanTransaction({
      loanId: id,
      returnedStatusId: returnedStatus.id,
      availStatusId: availStatus.id,
      txTypeId: txType.id,
      changedById,
      loanNumber: loan.loanNumber,
      items: dto.items,
    });
  }
}
