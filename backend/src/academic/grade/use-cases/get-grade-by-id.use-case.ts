import { Injectable, NotFoundException } from '@nestjs/common';
import { IGradeRepository } from '../domain/interfaces/grade-repository.interface.js';

@Injectable()
export class GetGradeByIdUseCase {
  constructor(private readonly gradeRepository: IGradeRepository) {}

  async execute(id: string) {
    const level = await this.gradeRepository.findById(id);
    if (!level) {
      throw new NotFoundException(`Classroom level with ID ${id} not found`);
    }
    return level;
  }
}
