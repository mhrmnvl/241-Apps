import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { IReportCardRepository } from '../domain/interfaces/report-card-repository.interface.js';

@Injectable()
export class PublishReportCardUseCase {
  private readonly logger = new Logger(PublishReportCardUseCase.name);

  constructor(private readonly reportCardRepository: IReportCardRepository) {}

  async execute(id: string) {
    const existing = await this.reportCardRepository.findById(id);
    if (!existing)
      throw new NotFoundException(`ReportCard with ID ${id} not found`);

    if (
      !existing.isPublished &&
      (existing.totalAverage === null || existing.totalAverage === undefined)
    ) {
      throw new BadRequestException(
        'Cannot publish report card without calculated total average grades',
      );
    }

    const updated = await this.reportCardRepository.update(id, {
      isPublished: !existing.isPublished,
    });

    this.logger.log(
      `ReportCard ${id} ${updated.isPublished ? 'published' : 'unpublished'}`,
    );
    return updated;
  }
}
