import { Injectable } from '@nestjs/common';
import { IAcademicCalendarRepository } from '../domain/interfaces/academic-calendar-repository.interface.js';
import { AcademicCalendarQueryDto } from '../dto/request/academic-calendar-query.dto.js';

@Injectable()
export class GetAcademicCalendarsUseCase {
  constructor(
    private readonly academicCalendarRepository: IAcademicCalendarRepository,
  ) {}

  async execute(query: AcademicCalendarQueryDto) {
    return this.academicCalendarRepository.findAll(query);
  }
}
