import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { CreateAcademicCalendarTypeDto } from '../dto/create-academic-calendar-type.dto.js';
import { IAcademicCalendarTypeRepository } from '../domain/interfaces/academic-calendar-type-repository.interface.js';

@Injectable()
export class CreateAcademicCalendarTypeUseCase {
  private readonly logger = new Logger(CreateAcademicCalendarTypeUseCase.name);

  constructor(private readonly repository: IAcademicCalendarTypeRepository) {}

  async execute(dto: CreateAcademicCalendarTypeDto) {
    const existing = await this.repository.findByName(dto.name);
    if (existing) {
      throw new ConflictException(
        'AcademicCalendarType with name "' + dto.name + '" already exists',
      );
    }

    const item = await this.repository.create({
      name: dto.name,
      isActive: dto.isActive,
    });

    this.logger.log(`AcademicCalendarType created: ${item.name}`);
    return item;
  }
}
