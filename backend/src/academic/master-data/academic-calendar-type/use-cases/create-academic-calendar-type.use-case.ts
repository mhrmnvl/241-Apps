import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { CreateAcademicCalendarTypeDto } from '../dto/request/create-academic-calendar-type.dto.js';
import { IAcademicCalendarTypeRepository } from '../domain/interfaces/academic-calendar-type-repository.interface.js';

@Injectable()
export class CreateAcademicCalendarTypeUseCase {
  private readonly logger = new Logger(CreateAcademicCalendarTypeUseCase.name);

  constructor(
    private readonly academicCalendarTypeRepository: IAcademicCalendarTypeRepository,
  ) {}

  async execute(dto: CreateAcademicCalendarTypeDto) {
    const existing = await this.academicCalendarTypeRepository.findByName(
      dto.name,
    );
    if (existing) {
      throw new ConflictException(
        'AcademicCalendarType with name "' + dto.name + '" already exists',
      );
    }

    const item = await this.academicCalendarTypeRepository.create({
      name: dto.name,
      isActive: dto.isActive,
    });

    this.logger.log(`AcademicCalendarType created: ${item.name}`);
    return item;
  }
}
