import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ICirculationRepository } from '../domain/interfaces/circulation-repository.interface.js';
import { CreateLoanDto } from '../dto/request/create-loan.dto.js';

@Injectable()
export class CreateLoanUseCase {
  constructor(private readonly circulationRepository: ICirculationRepository) {}

  async execute(dto: CreateLoanDto, requesterId: string) {
    const pendingStatus =
      await this.circulationRepository.findStatusBySystemKey('LOAN_PENDING');

    if (!pendingStatus) {
      throw new NotFoundException(
        'The PENDING_APPROVAL status role is not configured under Reference > Asset Status',
      );
    }

    // 1. Verify units exist and are available
    const units = await this.circulationRepository.findUnitsByIds(dto.unitIds);

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
    const latestLoan = await this.circulationRepository.findLatestLoan();
    const todayStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    let nextSeq = 1;
    if (latestLoan?.loanNumber.startsWith(`LN-${todayStr}`)) {
      const parts = latestLoan.loanNumber.split('-');
      nextSeq = parseInt(parts[parts.length - 1] || '0') + 1;
    }
    const loanNumber = `LN-${todayStr}-${nextSeq.toString().padStart(4, '0')}`;

    // 3. Create Loan in a transaction via repository
    return this.circulationRepository.processCreateLoanTransaction({
      loanNumber,
      requesterId,
      expectedReturnDate: new Date(dto.expectedReturnDate),
      purpose: dto.purpose,
      pendingStatusId: String(pendingStatus.id),
      unitIds: dto.unitIds,
      units,
    });
  }
}
