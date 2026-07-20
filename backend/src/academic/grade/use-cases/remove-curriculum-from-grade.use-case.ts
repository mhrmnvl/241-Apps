import { Injectable, NotFoundException } from '@nestjs/common';
import { IGradeAcademicYearRepository } from '../domain/interfaces/grade-academic-year-repository.interface.js';

@Injectable()
export class RemoveCurriculumFromGradeUseCase {
  constructor(private readonly repository: IGradeAcademicYearRepository) {}

  async execute(id: string) {
    const existing = await this.repository.findAll();
    const record = existing.find((r) => r.id === id);
    if (!record)
      throw new NotFoundException(`GradeAcademicYear with ID ${id} not found`);
    await this.repository.delete(id);
  }
}
