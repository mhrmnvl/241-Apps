import { Injectable, NotFoundException } from '@nestjs/common';
import { IGraduationRepository } from '../domain/interfaces/graduation-repository.interface.js';

@Injectable()
export class GetStudentGraduationByIdUseCase {
  constructor(private readonly repo: IGraduationRepository) {}
  async execute(id: string) {
    const graduation = await this.repo.findById(id);
    if (!graduation) {
      throw new NotFoundException(`StudentGraduation ${id} not found`);
    }
    return graduation;
  }
}
