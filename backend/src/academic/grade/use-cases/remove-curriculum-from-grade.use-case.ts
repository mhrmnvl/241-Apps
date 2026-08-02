import { Injectable, NotFoundException } from '@nestjs/common';
import { IGradeAcademicYearRepository } from '../domain/interfaces/grade-academic-year-repository.interface.js';

@Injectable()
export class RemoveCurriculumFromGradeUseCase {
  constructor(
    private readonly gradeAcademicYearRepository: IGradeAcademicYearRepository,
  ) {}

  async execute(id: string) {
    const record = await this.gradeAcademicYearRepository.findById(id);
    if (!record)
      throw new NotFoundException(`GradeAcademicYear with ID ${id} not found`);
    await this.gradeAcademicYearRepository.remove(id);
  }
}
