import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BatchUpsertScheduleDto } from '../dto/request/schedule.dto.js';
import { IScheduleRepository } from '../domain/interfaces/schedule-repository.interface.js';

@Injectable()
export class BatchUpsertScheduleUseCase {
  constructor(private readonly repo: IScheduleRepository) {}

  async execute(classroomId: string, dto: BatchUpsertScheduleDto) {
    const classroom = await this.repo.findValidClassroomById(classroomId);
    if (!classroom) {
      throw new NotFoundException('Classroom not found');
    }

    const semester = await this.repo.findActiveSemester();
    if (!semester) {
      throw new BadRequestException('Tidak ada semester aktif');
    }

    await this.repo.softDeleteByClassroomAndDay(classroomId, dto.day);

    if (dto.lessons.length === 0) {
      return { created: 0, day: dto.day };
    }

    let created = 0;
    for (const row of dto.lessons) {
      let ta = await this.repo.findTeachingAssignmentBySubjectAndSemester(
        classroomId,
        row.subjectId,
        semester.id,
      );

      if (!ta) {
        const teacherId = await this.repo.findAnyTeacherIdForSubject(
          row.subjectId,
        );

        if (!teacherId) {
          throw new BadRequestException(
            `Tidak ada guru yang mengajar mapel dengan ID ${row.subjectId}`,
          );
        }

        ta = await this.repo.createTeachingAssignment({
          classroomId,
          subjectId: row.subjectId,
          teacherId,
          semesterId: semester.id,
        });
      }

      const softDeleted = await this.repo.findSoftDeleted(
        ta.id,
        dto.day,
        row.timeSlotId,
      );
      if (softDeleted) {
        await this.repo.restore(softDeleted.id, {});
      } else {
        await this.repo.create({
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
