import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { IAcademicYearRepository } from '../../academic-year/index.js';
import { UpdateSemesterDto } from '../dto/update-semester.dto.js';
import { ISemesterRepository } from '../domain/interfaces/semester-repository.interface.js';

@Injectable()
export class UpdateSemesterUseCase {
  private readonly logger = new Logger(UpdateSemesterUseCase.name);

  constructor(
    private readonly repository: ISemesterRepository,
    private readonly academicYearRepository: IAcademicYearRepository,
  ) {}

  async execute(id: string, dto: UpdateSemesterDto) {
    const current = await this.repository.findById(id);
    if (!current) {
      throw new NotFoundException(`Semester with ID ${id} not found`);
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

    if (dto.typeId) {
      const semesterType = await this.repository.findTypeById(dto.typeId);
      if (!semesterType) {
        throw new NotFoundException(
          `Semester Type with ID ${dto.typeId} not found`,
        );
      }
    }

    if (dto.typeId || dto.academicYearId) {
      const checkAyId = dto.academicYearId ?? current.academicYearId;
      const checkTypeId = dto.typeId ?? current.typeId;

      const existing = await this.repository.findByAcademicYearAndType(
        checkAyId,
        checkTypeId,
      );
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Semester already exists for this Academic Year`,
        );
      }
    }

    const checkStartDate = dto.startDate ?? current.startDate;
    const checkEndDate = dto.endDate ?? current.endDate;

    if (checkStartDate && checkEndDate) {
      if (new Date(checkEndDate) <= new Date(checkStartDate)) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    const updateData = {
      ...dto,
      ...(dto.startDate !== undefined && {
        startDate: dto.startDate ? new Date(dto.startDate) : null,
      }),
      ...(dto.endDate !== undefined && {
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      }),
    };

    const updated = await this.repository.update(id, updateData);
    this.logger.log(`Semester updated: ${id}`);
    return updated;
  }
}
