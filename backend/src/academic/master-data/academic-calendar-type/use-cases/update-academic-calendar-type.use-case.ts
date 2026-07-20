import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdateAcademicCalendarTypeDto } from '../dto/request/update-academic-calendar-type.dto.js';
import { IAcademicCalendarTypeRepository } from '../domain/interfaces/academic-calendar-type-repository.interface.js';

@Injectable()
export class UpdateAcademicCalendarTypeUseCase {
  private readonly logger = new Logger(UpdateAcademicCalendarTypeUseCase.name);

  constructor(private readonly repository: IAcademicCalendarTypeRepository) {}

  async execute(id: string, dto: UpdateAcademicCalendarTypeDto) {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new NotFoundException(
        'AcademicCalendarType with ID ${id} not found',
      );
    }

    if (dto.name) {
      const existing = await this.repository.findByName(dto.name, id);
      if (existing) {
        throw new ConflictException(
          'AcademicCalendarType with name "' + dto.name + '" already exists',
        );
      }
    }

    const updated = await this.repository.update(id, dto);
    this.logger.log(`AcademicCalendarType updated: ${updated.name}`);
    return updated;
  }
}
