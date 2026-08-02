import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IAcademicYearRepository } from '../domain/interfaces/academic-year-repository.interface.js';

@Injectable()
export class DeactivateAcademicYearUseCase {
  constructor(
    private readonly academicYearRepository: IAcademicYearRepository,
  ) {}

  async execute(id: string) {
    const current = await this.academicYearRepository.findById(id);
    if (!current) {
      throw new NotFoundException(`Academic Year with ID ${id} not found`);
    }

    if (!current.isActive) {
      return current;
    }

    const activeCount = await this.academicYearRepository.countActive();
    if (activeCount <= 1) {
      throw new BadRequestException(
        'Cannot deactivate the only active academic year. Activate another one first.',
      );
    }

    const hasData = await this.academicYearRepository.hasRelatedData(id);
    if (hasData) {
      throw new BadRequestException(
        'Cannot deactivate academic year that has active enrollment data. ' +
          'Complete, promote, or drop all active enrollments first.',
      );
    }

    const deactivated = await this.academicYearRepository.update(id, {
      isActive: false,
    });

    await this.academicYearRepository.deactivateSemestersByAcademicYearId(id);

    return deactivated;
  }
}
