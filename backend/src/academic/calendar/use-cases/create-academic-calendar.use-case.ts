import { Injectable, NotFoundException } from '@nestjs/common';
import { IAcademicYearRepository } from '../../academic-year/index.js';
import { ISemesterRepository } from '../../semester/index.js';
import { CreateAcademicCalendarDto } from '../dto/request/create-academic-calendar.dto.js';
import { IAcademicCalendarRepository } from '../domain/interfaces/academic-calendar-repository.interface.js';

@Injectable()
export class CreateAcademicCalendarUseCase {
  constructor(
    private readonly repository: IAcademicCalendarRepository,
    private readonly academicYearRepository: IAcademicYearRepository,
    private readonly semesterRepository: ISemesterRepository,
  ) {}

  async execute(dto: CreateAcademicCalendarDto) {
    const academicYear = await this.academicYearRepository.findById(
      dto.academicYearId,
    );
    if (!academicYear) {
      throw new NotFoundException(
        `Academic year with id ${dto.academicYearId} not found`,
      );
    }

    if (dto.semesterId) {
      const semester = await this.semesterRepository.findById(dto.semesterId);
      if (!semester) {
        throw new NotFoundException(
          `Semester with id ${dto.semesterId} not found`,
        );
      }
    }

    return this.repository.create(dto);
  }
}
