import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BatchUpsertScheduleDto } from '../dto/request/schedule.dto.js';
import { IScheduleRepository } from '../domain/interfaces/schedule-repository.interface.js';

@Injectable()
export class BatchUpsertScheduleUseCase {
  constructor(private readonly repository: IScheduleRepository) {}

  async execute(classroomId: string, dto: BatchUpsertScheduleDto) {
    const classroom = await this.repository.findValidClassroomById(classroomId);
    if (!classroom) {
      throw new NotFoundException('Classroom not found');
    }

    const semester = await this.repository.findActiveSemester();
    if (!semester) {
      throw new BadRequestException('Tidak ada semester aktif');
    }

    await this.repository.softDeleteByClassroomAndDay(classroomId, dto.day);

    if (dto.lessons.length === 0) {
      return { created: 0, day: dto.day };
    }

    let created = 0;
    for (const row of dto.lessons) {
      let ta = await this.repository.findTeachingAssignmentBySubjectAndSemester(
        classroomId,
        row.subjectId,
        semester.id,
      );

      if (!ta) {
        const teacherId = await this.repository.findAnyTeacherIdForSubject(
          row.subjectId,
        );

        if (!teacherId) {
          throw new BadRequestException(
            `Tidak ada guru yang mengajar mapel dengan ID ${row.subjectId}`,
          );
        }

        ta = await this.repository.createTeachingAssignment({
          classroomId,
          subjectId: row.subjectId,
          teacherId,
          semesterId: semester.id,
        });
      }

      const softDeleted = await this.repository.findSoftDeleted(
        ta.id,
        dto.day,
        row.timeSlotId,
      );
      if (softDeleted) {
        await this.repository.restore(softDeleted.id, {});
      } else {
        await this.repository.create({
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
