import { ConflictException, Injectable } from '@nestjs/common';
import { CreateStudentGraduationDto } from '../dto/request/create-student-graduation.dto.js';
import { IGraduationRepository } from '../domain/interfaces/graduation-repository.interface.js';

@Injectable()
export class CreateStudentGraduationUseCase {
  constructor(private readonly graduationRepository: IGraduationRepository) {}
  async execute(dto: CreateStudentGraduationDto) {
    const existing = await this.graduationRepository.findByStudentId(
      dto.studentId,
    );
    if (existing) {
      throw new ConflictException('Student already has a graduation record');
    }
    const { graduationDate, ...rest } = dto;
    return this.graduationRepository.create({
      ...rest,
      ...(graduationDate !== undefined && {
        graduationDate: new Date(graduationDate),
      }),
    });
  }
}
