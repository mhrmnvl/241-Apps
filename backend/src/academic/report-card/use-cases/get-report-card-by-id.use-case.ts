import { Injectable, NotFoundException } from '@nestjs/common';
import { IReportCardRepository } from '../domain/interfaces/report-card-repository.interface.js';

@Injectable()
export class GetReportCardByIdUseCase {
  constructor(private readonly repo: IReportCardRepository) {}

  async execute(id: string) {
    const reportCard = await this.repo.findById(id);
    if (!reportCard)
      throw new NotFoundException(`ReportCard with ID ${id} not found`);
    return reportCard;
  }
}
