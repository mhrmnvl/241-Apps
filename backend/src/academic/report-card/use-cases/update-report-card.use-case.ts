import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UpdateReportCardDto } from '../dto/request/update-report-card.dto.js';
import { IReportCardRepository } from '../domain/interfaces/report-card-repository.interface.js';

@Injectable()
export class UpdateReportCardUseCase {
  private readonly logger = new Logger(UpdateReportCardUseCase.name);

  constructor(private readonly reportCardRepository: IReportCardRepository) {}

  async execute(id: string, dto: UpdateReportCardDto) {
    const existing = await this.reportCardRepository.findById(id);
    if (!existing)
      throw new NotFoundException(`ReportCard with ID ${id} not found`);

    // Named field by field, and `isPublished` is not among them: publishing
    // goes through PublishReportCardUseCase, which holds the guard and the
    // separate permission.
    const updated = await this.reportCardRepository.update(id, {
      teacherNote: dto.teacherNote,
      rank: dto.rank,
    });

    this.logger.log(`ReportCard updated: ${id}`);
    return updated;
  }
}
