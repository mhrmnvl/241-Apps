import { Injectable, NotFoundException } from '@nestjs/common';
import { IAcademicCalendarTypeRepository } from '../domain/interfaces/academic-calendar-type-repository.interface.js';

@Injectable()
export class GetAcademicCalendarTypeByIdUseCase {
  constructor(
    private readonly academicCalendarTypeRepository: IAcademicCalendarTypeRepository,
  ) {}

  async execute(id: string) {
    const item = await this.academicCalendarTypeRepository.findById(id);
    if (!item) {
      throw new NotFoundException(
        'AcademicCalendarType with ID ${id} not found',
      );
    }
    return item;
  }
}
