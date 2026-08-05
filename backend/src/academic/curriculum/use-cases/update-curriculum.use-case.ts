import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { IAcademicYearRepository } from '../../academic-year/index.js';
import { UpdateCurriculaDto } from '../dto/request/update-curriculum.dto.js';
import { ICurriculumRepository } from '../domain/interfaces/curriculum-repository.interface.js';

@Injectable()
export class UpdateCurriculaUseCase {
  private readonly logger = new Logger(UpdateCurriculaUseCase.name);

  constructor(
    private readonly curriculumRepository: ICurriculumRepository,
    private readonly academicYearRepository: IAcademicYearRepository,
  ) {}

  async execute(id: string, dto: UpdateCurriculaDto) {
    const current = await this.curriculumRepository.findById(id);
    if (!current) {
      throw new NotFoundException(`Curricula with ID ${id} not found`);
    }

    if (dto.academicYearId && dto.academicYearId !== current.academicYearId) {
      const academicYear = await this.academicYearRepository.findById(
        dto.academicYearId,
      );
      if (!academicYear) {
        throw new NotFoundException(
          `Academic Year with ID ${dto.academicYearId} not found`,
        );
      }
    }

    const newAcademicYearId = dto.academicYearId ?? current.academicYearId;
    const newName = dto.name ?? current.name;

    if (
      newAcademicYearId !== current.academicYearId ||
      newName !== current.name
    ) {
      const duplicate =
        await this.curriculumRepository.findByNameAndAcademicYear(
          newName,
          newAcademicYearId,
          id,
        );
      if (duplicate) {
        throw new ConflictException(
          `Curricula with name "${newName}" already exists in this academic year`,
        );
      }
    }

    const updated = await this.curriculumRepository.update(id, {
      academicYearId: dto.academicYearId,
      name: dto.name,
      isActive: dto.isActive,
    });
    this.logger.log(`Curricula updated: ${id}`);
    return updated;
  }
}
