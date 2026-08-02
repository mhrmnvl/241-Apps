import { Injectable, NotFoundException } from '@nestjs/common';
import { IReportCardRepository } from '../domain/interfaces/report-card-repository.interface.js';

@Injectable()
export class GetReportCardByIdUseCase {
  constructor(private readonly reportCardRepository: IReportCardRepository) {}

  async execute(id: string) {
    const reportCard = await this.reportCardRepository.findById(id);
    if (!reportCard)
      throw new NotFoundException(`ReportCard with ID ${id} not found`);
    return reportCard;
  }
}
