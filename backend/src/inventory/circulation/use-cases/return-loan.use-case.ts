import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ICirculationRepository } from '../domain/interfaces/circulation-repository.interface.js';
import { ReturnLoanDto } from '../dto/request/return-loan.dto.js';

@Injectable()
export class ReturnLoanUseCase {
  constructor(private readonly circulationRepository: ICirculationRepository) {}

  async execute(id: string, dto: ReturnLoanDto, changedById: string) {
    const loan = await this.circulationRepository.findLoanById(id);
    if (!loan) {
      throw new NotFoundException('Loan transaction not found.');
    }

    const returnedStatus =
      await this.circulationRepository.findStatusBySystemKey('LOAN_RETURNED');
    const availStatus =
      await this.circulationRepository.findStatusBySystemKey('AVAILABLE');
    const txType =
      await this.circulationRepository.findTransactionTypeByCode('TX-LOAN-IN');

    if (!returnedStatus || !availStatus || !txType) {
      throw new NotFoundException(
        'The JUST_RETURNED/AVAILABLE status roles are not configured, or the TX-LOAN-IN transaction type is missing',
      );
    }

    if (loan.actualReturnDate) {
      throw new BadRequestException(
        'This loan has already been fully returned.',
      );
    }

    for (const itemDto of dto.items) {
      const loanItem = (loan.items ?? []).find(
        (i) => i.unitId === itemDto.unitId,
      );
      if (!loanItem) {
        throw new BadRequestException(
          `Unit ID ${itemDto.unitId} is not part of this loan.`,
        );
      }
    }

    return this.circulationRepository.processReturnLoanTransaction({
      loanId: id,
      returnedStatusId: String(returnedStatus.id),
      availStatusId: String(availStatus.id),
      txTypeId: String(txType.id),
      changedById,
      loanNumber: loan.loanNumber,
      items: dto.items.map((item) => ({
        unitId: item.unitId,
        conditionId: item.returnedConditionId,
        note: item.notes,
      })),
    });
  }
}
