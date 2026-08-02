import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateStudentEnrollmentDto } from '../dto/request/update-student-enrollment.dto.js';
import { IEnrollmentRepository } from '../domain/interfaces/enrollment-repository.interface.js';

@Injectable()
export class UpdateStudentEnrollmentUseCase {
  constructor(private readonly enrollmentRepository: IEnrollmentRepository) {}
  async execute(id: string, dto: UpdateStudentEnrollmentDto) {
    const enrollment = await this.enrollmentRepository.findById(id);
    if (!enrollment) {
      throw new NotFoundException(`StudentEnrollment ${id} not found`);
    }
    const { endedAt, ...rest } = dto;
    return this.enrollmentRepository.update(id, {
      ...rest,
      ...(endedAt !== undefined && { endedAt: new Date(endedAt) }),
    });
  }
}
