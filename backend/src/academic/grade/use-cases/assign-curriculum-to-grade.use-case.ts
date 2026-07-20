import { Injectable } from '@nestjs/common';
import { IGradeAcademicYearRepository } from '../domain/interfaces/grade-academic-year-repository.interface.js';
import { AssignCurriculumToGradeDto } from '../dto/request/assign-curriculum-to-grade.dto.js';

@Injectable()
export class AssignCurriculumToGradeUseCase {
  constructor(private readonly repository: IGradeAcademicYearRepository) {}

  async execute(dto: AssignCurriculumToGradeDto) {
    return this.repository.upsert({
      gradeId: dto.gradeId,
      academicYearId: dto.academicYearId,
      curriculumId: dto.curriculumId,
    });
  }
}
