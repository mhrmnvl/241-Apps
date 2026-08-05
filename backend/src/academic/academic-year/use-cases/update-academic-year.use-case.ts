import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdateAcademicYearDto } from '../dto/request/update-academic-year.dto.js';
import { IAcademicYearRepository } from '../domain/interfaces/academic-year-repository.interface.js';

@Injectable()
export class UpdateAcademicYearUseCase {
  private readonly logger = new Logger(UpdateAcademicYearUseCase.name);

  constructor(
    private readonly academicYearRepository: IAcademicYearRepository,
  ) {}

  async execute(id: string, dto: UpdateAcademicYearDto) {
    const current = await this.academicYearRepository.findById(id);
    if (!current) {
      throw new NotFoundException(`Academic Year with ID ${id} not found`);
    }

    if (dto.name && dto.name !== current.name) {
      const existing = await this.academicYearRepository.findByName(dto.name);
      if (existing) {
        throw new ConflictException(
          `Academic Year "${dto.name}" already exists`,
        );
      }
    }

    // `isActive` is not editable here: activating a year deactivates every
    // other one, so it goes through the dedicated activate/deactivate paths.
    const updated = await this.academicYearRepository.update(id, {
      name: dto.name,
    });
    this.logger.log(`Academic Year updated: ${id}`);
    return updated;
  }
}
