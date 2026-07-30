import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateScheduleDto } from '../dto/request/schedule.dto.js';
import { IScheduleRepository } from '../domain/interfaces/schedule-repository.interface.js';

@Injectable()
export class CreateScheduleUseCase {
  constructor(private readonly repo: IScheduleRepository) {}
  async execute(dto: CreateScheduleDto) {
    const ta = await this.repo.findTeachingAssignmentById(
      dto.teachingAssignmentId,
    );
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
