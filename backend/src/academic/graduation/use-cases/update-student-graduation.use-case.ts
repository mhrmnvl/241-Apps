import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateStudentGraduationDto } from '../dto/request/update-student-graduation.dto.js';
import { IGraduationRepository } from '../domain/interfaces/graduation-repository.interface.js';

@Injectable()
export class UpdateStudentGraduationUseCase {
  constructor(private readonly graduationRepository: IGraduationRepository) {}
  async execute(id: string, dto: UpdateStudentGraduationDto) {
    const graduation = await this.graduationRepository.findById(id);
    if (!graduation) {
      throw new NotFoundException(`StudentGraduation ${id} not found`);
    }
    const { graduationDate, ...rest } = dto;
    return this.graduationRepository.update(id, {
      ...rest,
      ...(graduationDate !== undefined && {
        graduationDate: new Date(graduationDate),
      }),
    });
  }
}
