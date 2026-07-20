import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { CreateAcademicYearDto } from '../dto/request/create-academic-year.dto.js';
import { IAcademicYearRepository } from '../domain/interfaces/academic-year-repository.interface.js';

@Injectable()
export class CreateAcademicYearUseCase {
  private readonly logger = new Logger(CreateAcademicYearUseCase.name);

  constructor(private readonly repository: IAcademicYearRepository) {}

  async execute(dto: CreateAcademicYearDto) {
    const existing = await this.repository.findByName(dto.name);
    if (existing) {
      throw new ConflictException(`Academic Year "${dto.name}" already exists`);
    }

    if (dto.isActive) {
      await this.repository.deactivateAll();
    }

    const academicYear = await this.repository.create({
      name: dto.name,
      isActive: dto.isActive ?? false,
    });

    this.logger.log(`Academic Year created: ${dto.name}`);

    return academicYear;
  }
}
