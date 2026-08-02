import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { IAcademicYearRepository } from '../domain/interfaces/academic-year-repository.interface.js';

@Injectable()
export class DeleteAcademicYearUseCase {
  private readonly logger = new Logger(DeleteAcademicYearUseCase.name);

  constructor(
    private readonly academicYearRepository: IAcademicYearRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const year = await this.academicYearRepository.findById(id);
    if (!year) {
      throw new NotFoundException(`Academic Year with ID ${id} not found`);
    }

    if (year.isActive) {
      throw new BadRequestException(
        'Cannot delete an active academic year. Deactivate it first.',
      );
    }

    const hasData = await this.academicYearRepository.hasRelatedData(id);
    if (hasData) {
      throw new BadRequestException(
        'Cannot delete academic year that has enrollment data',
      );
    }

    await this.academicYearRepository.softDelete(id);
    this.logger.log(`Academic Year soft-deleted: ${id}`);
  }
}
