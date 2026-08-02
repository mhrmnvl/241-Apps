import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IReportCardRepository } from '../domain/interfaces/report-card-repository.interface.js';

@Injectable()
export class DeleteReportCardUseCase {
  private readonly logger = new Logger(DeleteReportCardUseCase.name);

  constructor(private readonly reportCardRepository: IReportCardRepository) {}

  async execute(id: string) {
    const existing = await this.reportCardRepository.findById(id);
    if (!existing)
      throw new NotFoundException(`ReportCard with ID ${id} not found`);

    await this.reportCardRepository.softDelete(id);
    this.logger.log(`ReportCard soft-deleted: ${id}`);
  }
}
