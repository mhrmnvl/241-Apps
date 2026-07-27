import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service.js';
import { CreateScheduleDto } from '../dto/request/schedule.dto.js';
import { IScheduleRepository } from '../domain/interfaces/schedule-repository.interface.js';

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
