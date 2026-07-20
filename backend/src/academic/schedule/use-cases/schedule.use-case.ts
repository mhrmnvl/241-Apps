import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service.js';
import {
  BatchUpsertScheduleDto,
  CreateScheduleDto,
  ScheduleQueryDto,
  UpdateScheduleDto,
} from '../dto/request/schedule.dto.js';
import { IScheduleRepository } from '../domain/interfaces/schedule-repository.interface.js';

@Injectable()
export class GetSchedulesUseCase {
  constructor(private readonly repo: IScheduleRepository) {}
  async execute(query: ScheduleQueryDto) {
    return this.repo.findAll(query);
  }
}

@Injectable()
export class GetScheduleByIdUseCase {
  constructor(private readonly repo: IScheduleRepository) {}
  async execute(id: string) {
    const r = await this.repo.findById(id);
    if (!r) throw new NotFoundException(`Schedule ${id} not found`);
    return r;
  }
}

@Injectable()
export class GetSchedulesByClassroomUseCase {
  constructor(private readonly repo: IScheduleRepository) {}
  async execute(classroomId: string) {
    return this.repo.findByClassroom(classroomId);
  }
}

@Injectable()
export class CreateScheduleUseCase {
  constructor(
    private readonly repo: IScheduleRepository,
    private readonly prisma: PrismaService,
  ) {}
  async execute(dto: CreateScheduleDto) {
    const ta = await this.prisma.teachingAssignment.findFirst({
      where: {
        id: dto.teachingAssignmentId,
        classroom: { academicYear: { deletedAt: null } },
        deletedAt: null,
      },
    });
    if (!ta) {
      throw new BadRequestException('Teaching assignment not found');
    }

    const dup = await this.repo.findDuplicate(
      dto.teachingAssignmentId,
      dto.day,
      dto.timeSlotId,
    );
    if (dup)
      throw new ConflictException(
        'Schedule already exists for this assignment, day and timeslot',
      );

    const softDeleted = await this.repo.findSoftDeleted(
      dto.teachingAssignmentId,
      dto.day,
      dto.timeSlotId,
    );
    if (softDeleted) {
      return this.repo.restore(softDeleted.id, {
        room: dto.room ?? undefined,
      });
    }

    return this.repo.create(dto);
  }
}

@Injectable()
export class UpdateScheduleUseCase {
  constructor(private readonly repo: IScheduleRepository) {}
  async execute(id: string, dto: UpdateScheduleDto) {
    const current = await this.repo.findById(id);
    if (!current) throw new NotFoundException(`Schedule ${id} not found`);
    const taId = dto.teachingAssignmentId ?? current.teachingAssignmentId;
    const day = dto.day ?? current.day;
    const tsId = dto.timeSlotId ?? current.timeSlotId;
    if (
      taId !== current.teachingAssignmentId ||
      day !== current.day ||
      tsId !== current.timeSlotId
    ) {
      const dup = await this.repo.findDuplicate(taId, day, tsId, id);
      if (dup) throw new ConflictException('Schedule already exists');
    }
    return this.repo.update(id, dto);
  }
}

@Injectable()
export class DeleteScheduleUseCase {
  constructor(private readonly repo: IScheduleRepository) {}
  async execute(id: string) {
    const r = await this.repo.findById(id);
    if (!r) throw new NotFoundException(`Schedule ${id} not found`);
    return this.repo.softDelete(id);
  }
}

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
