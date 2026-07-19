import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IAcademicCalendarTypeRepository } from '../domain/interfaces/academic-calendar-type-repository.interface.js';

@Injectable()
export class DeleteAcademicCalendarTypeUseCase {
  private readonly logger = new Logger(DeleteAcademicCalendarTypeUseCase.name);

  constructor(private readonly repository: IAcademicCalendarTypeRepository) {}

  async execute(id: string) {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new NotFoundException(
        'AcademicCalendarType with ID ${id} not found',
      );
    }

    await this.repository.softDelete(id);
    this.logger.log(`AcademicCalendarType deleted: ${item.name}`);
  }
}
