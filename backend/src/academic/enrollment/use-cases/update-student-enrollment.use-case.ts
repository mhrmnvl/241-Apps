import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateStudentEnrollmentDto } from '../dto/update-student-enrollment.dto.js';
import { IEnrollmentRepository } from '../domain/interfaces/enrollment-repository.interface.js';

@Injectable()
export class UpdateStudentEnrollmentUseCase {
  constructor(private readonly repo: IEnrollmentRepository) {}
  async execute(id: string, dto: UpdateStudentEnrollmentDto) {
    const enrollment = await this.repo.findById(id);
    if (!enrollment) {
      throw new NotFoundException(`StudentEnrollment ${id} not found`);
    }
    const { endedAt, ...rest } = dto;
    return this.repo.update(id, {
      ...rest,
      ...(endedAt && { endedAt: new Date(endedAt) }),
    });
  }
}
