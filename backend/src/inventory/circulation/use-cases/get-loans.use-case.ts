import { Injectable } from '@nestjs/common';
import { ICirculationRepository } from '../domain/interfaces/circulation-repository.interface.js';
import { LoanQueryDto } from '../dto/request/loan-query.dto.js';

@Injectable()
export class GetLoansUseCase {
  constructor(private readonly repository: ICirculationRepository) {}

  async execute(query: LoanQueryDto) {
    return this.repository.findAllLoans(query);
  }
}
