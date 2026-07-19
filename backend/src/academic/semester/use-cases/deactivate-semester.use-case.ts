import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ISemesterRepository } from '../domain/interfaces/semester-repository.interface.js';

@Injectable()
export class DeactivateSemesterUseCase {
  private readonly logger = new Logger(DeactivateSemesterUseCase.name);

  constructor(private readonly repository: ISemesterRepository) {}

  async execute(id: string) {
    const current = await this.repository.findById(id);
    if (!current) {
      throw new NotFoundException(`Semester with ID ${id} not found`);
    }

    if (!current.isActive) {
      return current;
    }

    const deactivated = await this.repository.update(id, { isActive: false });
    this.logger.log(`Semester deactivated: ${id}`);
    return deactivated;
  }
}
