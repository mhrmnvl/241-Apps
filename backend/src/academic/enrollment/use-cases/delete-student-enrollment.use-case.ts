import { Injectable, NotFoundException } from '@nestjs/common';
import { IEnrollmentRepository } from '../domain/interfaces/enrollment-repository.interface.js';

@Injectable()
export class DeleteStudentEnrollmentUseCase {
  constructor(private readonly repo: IEnrollmentRepository) {}
  async execute(id: string) {
    const enrollment = await this.repo.findById(id);
    if (!enrollment) {
      throw new NotFoundException(`StudentEnrollment ${id} not found`);
    }
    return this.repo.softDelete(id);
  }
}
