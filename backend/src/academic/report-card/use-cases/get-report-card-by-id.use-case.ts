import { Injectable, NotFoundException } from '@nestjs/common';
import { IReportCardRepository } from '../domain/interfaces/report-card-repository.interface.js';

@Injectable()
export class GetReportCardByIdUseCase {
  constructor(private readonly repository: IReportCardRepository) {}

  async execute(id: string) {
    const reportCard = await this.repository.findById(id);
    if (!reportCard)
      throw new NotFoundException(`ReportCard with ID ${id} not found`);
    return reportCard;
  }
}
