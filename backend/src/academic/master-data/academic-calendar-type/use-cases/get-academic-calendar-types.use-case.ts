import { Injectable } from '@nestjs/common';
import { AcademicCalendarTypeQueryDto } from '../dto/request/academic-calendar-type-query.dto.js';
import { IAcademicCalendarTypeRepository } from '../domain/interfaces/academic-calendar-type-repository.interface.js';

@Injectable()
export class GetAcademicCalendarTypesUseCase {
  constructor(
    private readonly academicCalendarTypeRepository: IAcademicCalendarTypeRepository,
  ) {}

  async execute(query: AcademicCalendarTypeQueryDto) {
    const { data, total, page, limit } =
      await this.academicCalendarTypeRepository.findAll(query);
    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
