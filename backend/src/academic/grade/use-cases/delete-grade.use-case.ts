import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IGradeRepository } from '../domain/interfaces/grade-repository.interface.js';

@Injectable()
export class DeleteGradeUseCase {
  private readonly logger = new Logger(DeleteGradeUseCase.name);

  constructor(private readonly gradeRepository: IGradeRepository) {}

  async execute(id: string) {
    const level = await this.gradeRepository.findById(id);
    if (!level) {
      throw new NotFoundException(`Classroom level with ID ${id} not found`);
    }

    await this.gradeRepository.softDelete(id);
    this.logger.log(`Classroom level deleted: ${id}`);
  }
}
