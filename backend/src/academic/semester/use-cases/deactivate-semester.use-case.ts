import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ISemesterRepository } from '../domain/interfaces/semester-repository.interface.js';

@Injectable()
export class DeactivateSemesterUseCase {
  private readonly logger = new Logger(DeactivateSemesterUseCase.name);

  constructor(private readonly semesterRepository: ISemesterRepository) {}

  async execute(id: string) {
    const current = await this.semesterRepository.findById(id);
    if (!current) {
      throw new NotFoundException(`Semester with ID ${id} not found`);
    }

    if (!current.isActive) {
      return current;
    }

    const deactivated = await this.semesterRepository.update(id, {
      isActive: false,
    });
    this.logger.log(`Semester deactivated: ${id}`);
    return deactivated;
  }
}
