import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UpdateReportCardDto } from '../dto/update-report-card.dto.js';
import { IReportCardRepository } from '../domain/interfaces/report-card-repository.interface.js';

@Injectable()
export class UpdateReportCardUseCase {
  private readonly logger = new Logger(UpdateReportCardUseCase.name);

  constructor(private readonly repo: IReportCardRepository) {}

  async execute(id: string, dto: UpdateReportCardDto) {
    const existing = await this.repo.findById(id);
    if (!existing)
      throw new NotFoundException(`ReportCard with ID ${id} not found`);

    const updated = await this.repo.update(id, {
      teacherNote: dto.teacherNote,
      rank: dto.rank,
      isPublished: dto.isPublished,
    });

    this.logger.log(`ReportCard updated: ${id}`);
    return updated;
  }
}
