import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IAcademicYearRepository } from '../../academic-year/index.js';
import { IClassroomRepository } from '../../classroom/domain/interfaces/classroom-repository.interface.js';
import { ISemesterRepository } from '../../semester/index.js';
import { CreateAcademicCalendarDto } from '../dto/request/create-academic-calendar.dto.js';
import { IAcademicCalendarRepository } from '../domain/interfaces/academic-calendar-repository.interface.js';

@Injectable()
export class CreateAcademicCalendarUseCase {
  constructor(
    private readonly academicCalendarRepository: IAcademicCalendarRepository,
    private readonly academicYearRepository: IAcademicYearRepository,
    private readonly semesterRepository: ISemesterRepository,
    private readonly classroomRepository: IClassroomRepository,
  ) {}

  /**
   * Every classroom named must exist.
   *
   * Without this the ids reach Prisma and a typo comes back as a foreign-key
   * error — a 500 that tells the person nothing, on a form where naming a class
   * is the whole point.
   */

  /**
   * Hours are optional, but half of them is not a state the calendar can show.
   *
   * "08:00 – " on a screen is a question, not a fact, so a start without an end
   * is refused here rather than rendered. Both absent is the ordinary entry: a
   * term, a holiday, anything measured in days.
   */
  private toTimes(
    startTime?: string,
    endTime?: string,
  ): { startTime: Date | null; endTime: Date | null } {
    if (!startTime && !endTime) return { startTime: null, endTime: null };
    if (!startTime || !endTime) {
      throw new BadRequestException(
        'An entry with hours needs both a start and an end time.',
      );
    }
    if (endTime <= startTime) {
      throw new BadRequestException('endTime must be after startTime.');
    }
    // Stored as time-of-day; the date part is a carrier the column discards.
    return {
      startTime: new Date(`1970-01-01T${startTime}:00Z`),
      endTime: new Date(`1970-01-01T${endTime}:00Z`),
    };
  }

  private async assertClassroomsExist(ids?: string[]): Promise<void> {
    for (const id of ids ?? []) {
      const classroom = await this.classroomRepository.findById(id);
      if (!classroom) {
        throw new NotFoundException(`Classroom with id ${id} not found`);
      }
    }
  }

  async execute(dto: CreateAcademicCalendarDto) {
    const academicYear = await this.academicYearRepository.findById(
      dto.academicYearId,
    );
    if (!academicYear) {
      throw new NotFoundException(
        `Academic year with id ${dto.academicYearId} not found`,
      );
    }

    if (dto.semesterId) {
      const semester = await this.semesterRepository.findById(dto.semesterId);
      if (!semester) {
        throw new NotFoundException(
          `Semester with id ${dto.semesterId} not found`,
        );
      }
    }

    await this.assertClassroomsExist(dto.classroomIds);

    return this.academicCalendarRepository.create({
      ...dto,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      ...this.toTimes(dto.startTime, dto.endTime),
    });
  }
}
