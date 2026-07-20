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

  constructor(private readonly repository: IAcademicYearRepository) {}

  async execute(id: string, dto: UpdateAcademicYearDto) {
    const current = await this.repository.findById(id);
    if (!current) {
      throw new NotFoundException(`Academic Year with ID ${id} not found`);
    }

    if (dto.name && dto.name !== current.name) {
      const existing = await this.repository.findByName(dto.name);
      if (existing) {
        throw new ConflictException(
          `Academic Year "${dto.name}" already exists`,
        );
      }
    }

    const updated = await this.repository.update(id, dto);
    this.logger.log(`Academic Year updated: ${id}`);
    return updated;
  }
}
