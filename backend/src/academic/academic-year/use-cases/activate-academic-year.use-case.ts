import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IAcademicYearRepository } from '../domain/interfaces/academic-year-repository.interface.js';

@Injectable()
export class ActivateAcademicYearUseCase {
  private readonly logger = new Logger(ActivateAcademicYearUseCase.name);

  constructor(private readonly repository: IAcademicYearRepository) {}

  async execute(id: string) {
    const current = await this.repository.findById(id);
    if (!current) {
      throw new NotFoundException(`Academic Year with ID ${id} not found`);
    }

    if (current.isActive) {
      return current;
    }

    const activated = await this.repository.activateById(id);
    this.logger.log(`Academic Year activated: ${id}`);
    return activated;
  }
}
