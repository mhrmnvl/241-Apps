import { Injectable } from '@nestjs/common';
import { AcademicYearQueryDto } from '../dto/request/academic-year-query.dto.js';
import { IAcademicYearRepository } from '../domain/interfaces/academic-year-repository.interface.js';

@Injectable()
export class GetAcademicYearsUseCase {
  constructor(
    private readonly academicYearRepository: IAcademicYearRepository,
  ) {}

  async execute(query: AcademicYearQueryDto) {
    const { data, total, page, limit } =
      await this.academicYearRepository.findAll(query);
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
