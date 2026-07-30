import { ConflictException, Injectable } from '@nestjs/common';
import { CreateStudentGraduationDto } from '../dto/request/create-student-graduation.dto.js';
import { IGraduationRepository } from '../domain/interfaces/graduation-repository.interface.js';

@Injectable()
export class CreateStudentGraduationUseCase {
  constructor(private readonly repository: IGraduationRepository) {}
  async execute(dto: CreateStudentGraduationDto) {
    const existing = await this.repository.findByStudentId(dto.studentId);
    if (existing) {
      throw new ConflictException('Student already has a graduation record');
    }
    return this.repository.create(dto);
  }
}
