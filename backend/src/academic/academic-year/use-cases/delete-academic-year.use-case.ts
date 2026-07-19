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

  constructor(private readonly repository: IAcademicYearRepository) {}

  async execute(id: string): Promise<void> {
    const year = await this.repository.findById(id);
    if (!year) {
      throw new NotFoundException(`Academic Year with ID ${id} not found`);
    }

    if (year.isActive) {
      throw new BadRequestException(
        'Cannot delete an active academic year. Deactivate it first.',
      );
    }

    const hasData = await this.repository.hasRelatedData(id);
    if (hasData) {
      throw new BadRequestException(
        'Cannot delete academic year that has enrollment data',
      );
    }

    await this.repository.softDelete(id);
    this.logger.log(`Academic Year soft-deleted: ${id}`);
  }
}
