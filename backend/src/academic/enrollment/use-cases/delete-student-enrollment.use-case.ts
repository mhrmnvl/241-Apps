import { Injectable, NotFoundException } from '@nestjs/common';
import { IEnrollmentRepository } from '../domain/interfaces/enrollment-repository.interface.js';

@Injectable()
export class DeleteStudentEnrollmentUseCase {
  constructor(private readonly repository: IEnrollmentRepository) {}
  async execute(id: string) {
    const enrollment = await this.repository.findById(id);
    if (!enrollment) {
      throw new NotFoundException(`StudentEnrollment ${id} not found`);
    }
    return this.repository.softDelete(id);
  }
}
