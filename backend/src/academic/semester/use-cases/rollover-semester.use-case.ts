import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  RolloverSemesterDto,
  RolloverSummaryDto,
} from '../dto/rollover-semester.dto.js';
import { IRolloverRepository } from '../domain/interfaces/rollover-repository.interface.js';

@Injectable()
export class RolloverSemesterUseCase {
  private readonly logger = new Logger(RolloverSemesterUseCase.name);

  constructor(private readonly rolloverRepository: IRolloverRepository) {}

  async execute(dto: RolloverSemesterDto): Promise<RolloverSummaryDto> {
    const { sourceSemesterId, targetSemesterId } = dto;

    if (sourceSemesterId === targetSemesterId) {
      throw new BadRequestException(
        'Source and target semester must be different',
      );
    }

    const [sourceSemester, targetSemester] = await Promise.all([
      this.rolloverRepository.findSemesterWithAcademicYear(sourceSemesterId),
      this.rolloverRepository.findSemesterWithAcademicYear(targetSemesterId),
    ]);

    if (!sourceSemester) {
      throw new NotFoundException(
        `Source semester with ID ${sourceSemesterId} not found`,
      );
    }
    if (!targetSemester) {
      throw new NotFoundException(
        `Target semester with ID ${targetSemesterId} not found`,
      );
    }

    if (sourceSemester.academicYearId !== targetSemester.academicYearId) {
      throw new BadRequestException(
        'Rollover only allowed within the same academic year. Use promotion for cross-year transitions.',
      );
    }

    if (
      sourceSemester.academicYear.id === targetSemester.academicYear.id &&
      sourceSemester.typeId === targetSemester.typeId
    ) {
      throw new BadRequestException(
        'Source and target semester type must be different',
      );
    }

    const sourceData = await this.rolloverRepository.fetchSourceData(
      sourceSemesterId,
      sourceSemester.academicYearId,
    );

    this.logger.log(
      `Rollover source data: ${sourceData.classrooms.length} classrooms, ` +
        `${sourceData.enrollments.length} enrollments, ` +
        `${sourceData.supervisors.length} supervisors, ` +
        `${sourceData.assignments.length} assignments`,
    );

    const summary = await this.rolloverRepository.executeRollover(
      sourceData,
      targetSemesterId,
      targetSemester.academicYearId,
    );

    this.logger.log(
      `Rollover completed: ` +
        `${summary.classrooms.created} classrooms, ` +
        `${summary.enrollments.created} enrollments, ` +
        `${summary.supervisors.created} supervisors, ` +
        `${summary.teachingAssignments.created} assignments, ` +
        `${summary.schedules.created} schedules created`,
    );

    return summary;
  }
}
