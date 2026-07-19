import { Injectable, NotFoundException } from '@nestjs/common';
import { ICurriculumRepository } from '../domain/interfaces/curriculum-repository.interface.js';

@Injectable()
export class GetCurriculaByIdUseCase {
  constructor(private readonly repository: ICurriculumRepository) {}

  async execute(id: string) {
    const curricula = await this.repository.findById(id);
    if (!curricula) {
      throw new NotFoundException(`Curricula with ID ${id} not found`);
    }
    return curricula;
  }
}
