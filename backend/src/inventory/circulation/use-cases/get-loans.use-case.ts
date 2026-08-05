import { Injectable } from '@nestjs/common';
import { ICirculationRepository } from '../domain/interfaces/circulation-repository.interface.js';
import { LoanQueryDto } from '../dto/request/loan-query.dto.js';

@Injectable()
export class GetLoansUseCase {
  constructor(private readonly circulationRepository: ICirculationRepository) {}

  async execute(query: LoanQueryDto) {
    return this.circulationRepository.findAllLoans({
      page: query.page,
      limit: query.limit,
      keyword: query.keyword,
      statusId: query.statusId,
      requesterId: query.requesterId,
      // The port also accepts `unitId`, but the DTO never exposed it.
    });
  }
}
