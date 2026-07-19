import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { IAcademicYearRepository } from '../../academic-year/index.js';
import { CreateSemesterDto } from '../dto/create-semester.dto.js';
import { ISemesterRepository } from '../domain/interfaces/semester-repository.interface.js';

@Injectable()
export class CreateSemesterUseCase {
  private readonly logger = new Logger(CreateSemesterUseCase.name);

  constructor(
    private readonly repository: ISemesterRepository,
    private readonly academicYearRepository: IAcademicYearRepository,
  ) {}

  async execute(dto: CreateSemesterDto) {
    const academicYear = await this.academicYearRepository.findById(
      dto.academicYearId,
    );
    if (!academicYear) {
      throw new NotFoundException(
        `Academic Year with ID ${dto.academicYearId} not found`,
      );
    }

    const semesterType = await this.repository.findTypeById(dto.typeId);
    if (!semesterType) {
      throw new NotFoundException(
        `Semester Type with ID ${dto.typeId} not found`,
      );
    }

    const existing = await this.repository.findByAcademicYearAndType(
      dto.academicYearId,
      dto.typeId,
    );
    if (existing) {
      throw new ConflictException(
        `Semester "${semesterType.name}" for Academic Year "${academicYear.name}" already exists`,
      );
    }

    if (dto.startDate && dto.endDate) {
      if (new Date(dto.endDate) <= new Date(dto.startDate)) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    if (dto.isActive) {
      await this.repository.deactivateAll();
    }

    const semester = await this.repository.create({
      academicYearId: dto.academicYearId,
      typeId: dto.typeId,
      isActive: dto.isActive ?? false,
      ...(dto.startDate && { startDate: new Date(dto.startDate) }),
      ...(dto.endDate && { endDate: new Date(dto.endDate) }),
    });

    this.logger.log(
      `Semester created: ${semesterType.name} - ${academicYear.name}`,
    );
    return semester;
  }
}
