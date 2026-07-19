import { Injectable, NotFoundException } from '@nestjs/common';
import { ICirculationRepository } from '../domain/interfaces/circulation-repository.interface.js';

@Injectable()
export class GetLoanByIdUseCase {
  constructor(private readonly repository: ICirculationRepository) {}

  async execute(id: string) {
    const loan = await this.repository.findLoanById(id);
    if (!loan) {
      throw new NotFoundException('Loan transaction not found.');
    }
    return loan;
  }
}
