import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateStudentGraduationDto } from '../dto/request/update-student-graduation.dto.js';
import { IGraduationRepository } from '../domain/interfaces/graduation-repository.interface.js';

@Injectable()
export class UpdateStudentGraduationUseCase {
  constructor(private readonly repo: IGraduationRepository) {}
  async execute(id: string, dto: UpdateStudentGraduationDto) {
    const graduation = await this.repo.findById(id);
    if (!graduation) {
      throw new NotFoundException(`StudentGraduation ${id} not found`);
    }
    return this.repo.update(id, dto);
  }
}
