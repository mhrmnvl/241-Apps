import { Injectable, NotFoundException } from '@nestjs/common';
import { IGraduationRepository } from '../domain/interfaces/graduation-repository.interface.js';

@Injectable()
export class DeleteStudentGraduationUseCase {
  constructor(private readonly graduationRepository: IGraduationRepository) {}
  async execute(id: string) {
    const graduation = await this.graduationRepository.findById(id);
    if (!graduation) {
      throw new NotFoundException(`StudentGraduation ${id} not found`);
    }
    return this.graduationRepository.softDelete(id);
  }
}
