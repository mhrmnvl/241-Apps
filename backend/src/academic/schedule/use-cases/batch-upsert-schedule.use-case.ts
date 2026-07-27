import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service.js';
import { BatchUpsertScheduleDto } from '../dto/request/schedule.dto.js';
import { IScheduleRepository } from '../domain/interfaces/schedule-repository.interface.js';

@Injectable()
export class BatchUpsertScheduleUseCase {
  constructor(
    private readonly repo: IScheduleRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(classroomId: string, dto: BatchUpsertScheduleDto) {
    const classroom = await this.prisma.classroom.findFirst({
      where: {
        id: classroomId,
        academicYear: { deletedAt: null },
        deletedAt: null,
      },
    });
    if (!classroom) {
      throw new NotFoundException('Classroom not found');
    }

    const semester = await this.prisma.semester.findFirst({
      where: {
        isActive: true,
        deletedAt: null,
        academicYear: { deletedAt: null },
      },
    });
    if (!semester) {
      throw new BadRequestException('Tidak ada semester aktif');
    }

    await this.repo.softDeleteByClassroomAndDay(classroomId, dto.day);

    if (dto.lessons.length === 0) {
      return { created: 0, day: dto.day };
    }

    let created = 0;
    for (const row of dto.lessons) {
      let ta = await this.prisma.teachingAssignment.findFirst({
        where: {
          classroomId,
          subjectId: row.subjectId,
          semesterId: semester.id,
          deletedAt: null,
        },
      });

      if (!ta) {
        const existingTa = await this.prisma.teachingAssignment.findFirst({
          where: { subjectId: row.subjectId, deletedAt: null },
          select: { teacherId: true },
        });

        if (!existingTa) {
          throw new BadRequestException(
            `Tidak ada guru yang mengajar mapel dengan ID ${row.subjectId}`,
          );
        }

        ta = await this.prisma.teachingAssignment.create({
          data: {
            classroomId,
            subjectId: row.subjectId,
            teacherId: existingTa.teacherId,
            semesterId: semester.id,
          },
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
