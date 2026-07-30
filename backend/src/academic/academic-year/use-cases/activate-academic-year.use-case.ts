import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { IAcademicYearRepository } from '../domain/interfaces/academic-year-repository.interface.js';

@Injectable()
export class ActivateAcademicYearUseCase {
  private readonly logger = new Logger(ActivateAcademicYearUseCase.name);

  constructor(
    private readonly academicYearRepository: IAcademicYearRepository,
  ) {}

  async execute(id: string) {
    const current = await this.academicYearRepository.findById(id);
    if (!current) {
      throw new NotFoundException(`Academic Year with ID ${id} not found`);
    }

    if (current.isActive) {
      return current;
    }

    const semesterCount = await this.academicYearRepository.countSemesters(id);
    if (semesterCount === 0) {
      throw new BadRequestException(
        'Cannot activate an academic year without any semesters. Create at least one semester first.',
      );
    }

    const activated = await this.academicYearRepository.activateById(id);
    this.logger.log(`Academic Year activated: ${id}`);
    return activated;
  }
}
