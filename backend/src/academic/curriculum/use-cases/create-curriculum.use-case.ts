import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { IAcademicYearRepository } from '../../academic-year/index.js';
import { CreateCurriculaDto } from '../dto/request/create-curriculum.dto.js';
import { ICurriculumRepository } from '../domain/interfaces/curriculum-repository.interface.js';

@Injectable()
export class CreateCurriculaUseCase {
  private readonly logger = new Logger(CreateCurriculaUseCase.name);

  constructor(
    private readonly curriculumRepository: ICurriculumRepository,
    private readonly academicYearRepository: IAcademicYearRepository,
  ) {}

  async execute(dto: CreateCurriculaDto) {
    const academicYear = await this.academicYearRepository.findById(
      dto.academicYearId,
    );
    if (!academicYear) {
      throw new NotFoundException(
        `Academic Year with ID ${dto.academicYearId} not found`,
      );
    }

    const existing = await this.curriculumRepository.findByNameAndAcademicYear(
      dto.name,
      dto.academicYearId,
    );
    if (existing) {
      throw new ConflictException(
        `Curricula with name "${dto.name}" already exists in this academic year`,
      );
    }

    const curricula = await this.curriculumRepository.create({
      academicYearId: dto.academicYearId,
      name: dto.name,
      isActive: dto.isActive,
    });

    this.logger.log(`Curricula created: ${dto.name}`);
    return curricula;
  }
}
