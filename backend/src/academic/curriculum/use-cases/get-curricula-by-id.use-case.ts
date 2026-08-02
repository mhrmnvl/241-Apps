import { Injectable, NotFoundException } from '@nestjs/common';
import { ICurriculumRepository } from '../domain/interfaces/curriculum-repository.interface.js';

@Injectable()
export class GetCurriculaByIdUseCase {
  constructor(private readonly curriculumRepository: ICurriculumRepository) {}

  async execute(id: string) {
    const curricula = await this.curriculumRepository.findById(id);
    if (!curricula) {
      throw new NotFoundException(`Curricula with ID ${id} not found`);
    }
    return curricula;
  }
}
