import { Injectable, NotFoundException } from '@nestjs/common';
import { ISemesterRepository } from '../../semester/index.js';
import { UpdateAcademicCalendarDto } from '../dto/request/update-academic-calendar.dto.js';
import { IAcademicCalendarRepository } from '../domain/interfaces/academic-calendar-repository.interface.js';

@Injectable()
export class UpdateAcademicCalendarUseCase {
  constructor(
    private readonly academicCalendarRepository: IAcademicCalendarRepository,
    private readonly semesterRepository: ISemesterRepository,
  ) {}

  async execute(id: string, dto: UpdateAcademicCalendarDto) {
    const calendar = await this.academicCalendarRepository.findById(id);
    if (!calendar) {
      throw new NotFoundException(`Academic calendar with id ${id} not found`);
    }

    if (dto.semesterId) {
      const semester = await this.semesterRepository.findById(dto.semesterId);
      if (!semester) {
        throw new NotFoundException(
          `Semester with id ${dto.semesterId} not found`,
        );
      }
    }

    const { startDate, endDate, ...rest } = dto;
    return this.academicCalendarRepository.update(id, {
      ...rest,
      ...(startDate !== undefined && { startDate: new Date(startDate) }),
      ...(endDate !== undefined && { endDate: new Date(endDate) }),
    });
  }
}
