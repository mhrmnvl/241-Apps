import { Injectable, NotFoundException } from '@nestjs/common';
import { IGraduationRepository } from '../domain/interfaces/graduation-repository.interface.js';

@Injectable()
export class DeleteStudentGraduationUseCase {
  constructor(private readonly repository: IGraduationRepository) {}
  async execute(id: string) {
    const graduation = await this.repository.findById(id);
    if (!graduation) {
      throw new NotFoundException(`StudentGraduation ${id} not found`);
    }
    return this.repository.softDelete(id);
  }
}
