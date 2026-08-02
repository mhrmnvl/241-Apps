import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ICurriculumRepository } from '../domain/interfaces/curriculum-repository.interface.js';

@Injectable()
export class DeleteCurriculaUseCase {
  private readonly logger = new Logger(DeleteCurriculaUseCase.name);

  constructor(private readonly curriculumRepository: ICurriculumRepository) {}

  async execute(id: string): Promise<void> {
    const curricula = await this.curriculumRepository.findById(id);
    if (!curricula) {
      throw new NotFoundException(`Curricula with ID ${id} not found`);
    }

    await this.curriculumRepository.softDelete(id);
    this.logger.log(`Curricula soft-deleted: ${id}`);
  }
}
