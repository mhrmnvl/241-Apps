import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { IAcademicYearRepository } from '../../academic-year/index.js';
import { UpdateSemesterDto } from '../dto/request/update-semester.dto.js';
import { ISemesterRepository } from '../domain/interfaces/semester-repository.interface.js';

@Injectable()
export class UpdateSemesterUseCase {
  private readonly logger = new Logger(UpdateSemesterUseCase.name);

  constructor(
    private readonly semesterRepository: ISemesterRepository,
    private readonly academicYearRepository: IAcademicYearRepository,
  ) {}

  async execute(id: string, dto: UpdateSemesterDto) {
    const current = await this.semesterRepository.findById(id);
    if (!current) {
      throw new NotFoundException(`Semester with ID ${id} not found`);
    }

    /**
     * Which academic year a semester belongs to, and which term it is, are the
     * two facts everything inside it is filed under. Enrolments, teaching
     * assignments, homeroom teachers, class structures and calendar entries all
     * key on `semesterId` — and report cards follow through the enrolment — so
     * re-pointing a semester that already holds any of them moves a whole term
     * into another year at once, silently and with nothing on any screen to
     * show it happened.
     *
     * A new academic year gets new semesters: `@@unique([academicYearId,
     * typeId])` allows exactly one Ganjil and one Genap per year, and ADR-0004
     * defines the two transitions — rollover within a year, promotion across
     * them. Neither moves a semester.
     *
     * Dates, and the semester's own fields, stay editable. Only the two that
     * decide whose data this is are locked once there is data.
     *
     * Same principle as ADR-0004's refusal to deactivate an academic year that
     * still has active enrolments: a period with something in it is not a field.
     */
    const movingYear =
      dto.academicYearId !== undefined &&
      dto.academicYearId !== current.academicYearId;
    const movingType =
      dto.typeId !== undefined && dto.typeId !== current.typeId;

    if (movingYear || movingType) {
      const dependent = await this.semesterRepository.findFirstDependent(id);
      if (dependent) {
        throw new ConflictException(
          `This semester already has ${dependent}, so its academic year and ` +
            'type can no longer be changed. Create a new semester in the ' +
            'target academic year instead.',
        );
      }
    }

    if (movingYear && dto.academicYearId) {
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
      const semesterType = await this.semesterRepository.findTypeById(
        dto.typeId,
      );
      if (!semesterType) {
        throw new NotFoundException(
          `Semester Type with ID ${dto.typeId} not found`,
        );
      }
    }

    if (dto.typeId || dto.academicYearId) {
      const checkAyId = dto.academicYearId ?? current.academicYearId;
      const checkTypeId = dto.typeId ?? current.typeId ?? '';

      const existing = await this.semesterRepository.findByAcademicYearAndType(
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

    const { startDate, endDate, ...rest } = dto;
    const updateData = {
      ...rest,
      ...(startDate !== undefined && {
        startDate: startDate ? new Date(startDate) : null,
      }),
      ...(endDate !== undefined && {
        endDate: endDate ? new Date(endDate) : null,
      }),
    };

    const updated = await this.semesterRepository.update(id, updateData);
    this.logger.log(`Semester updated: ${id}`);
    return updated;
  }
}
