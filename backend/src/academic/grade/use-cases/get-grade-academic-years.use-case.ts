import { Injectable } from '@nestjs/common';
import { IGradeAcademicYearRepository } from '../domain/interfaces/grade-academic-year-repository.interface.js';

@Injectable()
export class GetGradeAcademicYearsUseCase {
  constructor(
    private readonly gradeAcademicYearRepository: IGradeAcademicYearRepository,
  ) {}

  async execute(academicYearId?: string) {
    return this.gradeAcademicYearRepository.findAll(academicYearId);
  }
}
