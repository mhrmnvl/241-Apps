import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BatchUpsertScheduleDto } from '../dto/request/batch-upsert-schedule.dto.js';
import { IScheduleRepository } from '../domain/interfaces/schedule-repository.interface.js';
import { IScheduleLookupRepository } from '../domain/interfaces/schedule-lookup-repository.interface.js';

@Injectable()
export class BatchUpsertScheduleUseCase {
  constructor(
    private readonly scheduleRepository: IScheduleRepository,
    private readonly lookupRepository: IScheduleLookupRepository,
  ) {}

  async execute(classroomId: string, dto: BatchUpsertScheduleDto) {
    const classroom =
      await this.lookupRepository.findValidClassroomById(classroomId);
    if (!classroom) {
      throw new NotFoundException('Classroom not found');
    }

    const semester = await this.lookupRepository.findActiveSemester();
    if (!semester) {
      throw new BadRequestException('Tidak ada semester aktif');
    }

    await this.scheduleRepository.softDeleteByClassroomAndDay(
      classroomId,
      dto.day,
    );

    if (dto.lessons.length === 0) {
      return { created: 0, day: dto.day };
    }

    let created = 0;
    for (const row of dto.lessons) {
      let ta =
        await this.lookupRepository.findTeachingAssignmentBySubjectAndSemester(
          classroomId,
          row.subjectId,
          semester.id,
        );

      if (!ta) {
        const teacherId =
          await this.lookupRepository.findAnyTeacherIdForSubject(row.subjectId);

        if (!teacherId) {
          throw new BadRequestException(
            `No teacher is assigned to the subject ${row.subjectId}`,
          );
        }

        ta = await this.lookupRepository.createTeachingAssignment({
          classroomId,
          subjectId: row.subjectId,
          teacherId,
          semesterId: semester.id,
        });
      }

      const softDeleted = await this.scheduleRepository.findSoftDeleted(
        ta.id,
        dto.day,
        row.timeSlotId,
      );
      if (softDeleted) {
        await this.scheduleRepository.restore(softDeleted.id, {});
      } else {
        await this.scheduleRepository.create({
          teachingAssignmentId: ta.id,
          timeSlotId: row.timeSlotId,
          day: dto.day,
        });
      }
      created++;
    }

    return { created, day: dto.day };
  }
}
