import { Injectable } from '@nestjs/common';
import { ReportCardQueryDto } from '../dto/request/report-card-query.dto.js';
import { IReportCardRepository } from '../domain/interfaces/report-card-repository.interface.js';

@Injectable()
export class GetReportCardsUseCase {
  constructor(private readonly repository: IReportCardRepository) {}

  async execute(query: ReportCardQueryDto) {
    return this.repository.findAll(query);
  }
}
