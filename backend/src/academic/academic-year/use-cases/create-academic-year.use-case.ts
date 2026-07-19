import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { CreateAcademicYearDto } from '../dto/create-academic-year.dto.js';
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

    const copyClasses = dto.copyClassesFromPreviousYear !== false;

    const result = await this.repository.createWithSemestersAndClasses(
      {
        name: dto.name,
        isActive: dto.isActive ?? false,
      },
      copyClasses,
    );

    this.logger.log(
      `Academic Year created: ${dto.name} ` +
        `with 2 semesters and ${result.classroomsCreated} classrooms copied`,
    );

    return result;
  }
}
