import { Injectable } from '@nestjs/common';
import { AcademicYearQueryDto } from '../dto/academic-year-query.dto.js';
import { IAcademicYearRepository } from '../domain/interfaces/academic-year-repository.interface.js';

@Injectable()
export class GetAcademicYearsUseCase {
  constructor(private readonly repository: IAcademicYearRepository) {}

  async execute(query: AcademicYearQueryDto) {
    const { data, total, page, limit } = await this.repository.findAll(query);
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
