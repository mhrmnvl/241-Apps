import { Injectable, NotFoundException } from '@nestjs/common';
import { IEnrollmentRepository } from '../domain/interfaces/enrollment-repository.interface.js';

@Injectable()
export class GetStudentEnrollmentByIdUseCase {
  constructor(private readonly enrollmentRepository: IEnrollmentRepository) {}
  async execute(id: string) {
    const enrollment = await this.enrollmentRepository.findById(id);
    if (!enrollment) {
      throw new NotFoundException(`StudentEnrollment ${id} not found`);
    }
    return enrollment;
  }
}
