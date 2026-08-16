import { Injectable, NotFoundException } from '@nestjs/common';
import { IClassroomRepository } from '../../classroom/domain/interfaces/classroom-repository.interface.js';
import { ISemesterRepository } from '../../semester/index.js';
import { UpdateAcademicCalendarDto } from '../dto/request/update-academic-calendar.dto.js';
import { IAcademicCalendarRepository } from '../domain/interfaces/academic-calendar-repository.interface.js';

@Injectable()
export class UpdateAcademicCalendarUseCase {
  constructor(
    private readonly academicCalendarRepository: IAcademicCalendarRepository,
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
  private async assertClassroomsExist(ids?: string[]): Promise<void> {
    for (const id of ids ?? []) {
      const classroom = await this.classroomRepository.findById(id);
      if (!classroom) {
        throw new NotFoundException(`Classroom with id ${id} not found`);
      }
    }
  }

  async execute(id: string, dto: UpdateAcademicCalendarDto) {
    const calendar = await this.academicCalendarRepository.findById(id);
    if (!calendar) {
      throw new NotFoundException(`Academic calendar with id ${id} not found`);
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

    const { startDate, endDate, ...rest } = dto;
    return this.academicCalendarRepository.update(id, {
      ...rest,
      ...(startDate !== undefined && { startDate: new Date(startDate) }),
      ...(endDate !== undefined && { endDate: new Date(endDate) }),
    });
  }
}
