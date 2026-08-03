import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateScheduleDto } from '../dto/request/create-schedule.dto.js';
import { IScheduleRepository } from '../domain/interfaces/schedule-repository.interface.js';

@Injectable()
export class CreateScheduleUseCase {
  constructor(private readonly scheduleRepository: IScheduleRepository) {}
  async execute(dto: CreateScheduleDto) {
    const ta = await this.scheduleRepository.findTeachingAssignmentById(
      dto.teachingAssignmentId,
    );
    if (!ta) {
      throw new BadRequestException('Teaching assignment not found');
    }

    const dup = await this.scheduleRepository.findDuplicate(
      dto.teachingAssignmentId,
      dto.day,
      dto.timeSlotId,
    );
    if (dup)
      throw new ConflictException(
        'Schedule already exists for this assignment, day and timeslot',
      );

    const softDeleted = await this.scheduleRepository.findSoftDeleted(
      dto.teachingAssignmentId,
      dto.day,
      dto.timeSlotId,
    );
    if (softDeleted) {
      return this.scheduleRepository.restore(softDeleted.id, {
        room: dto.room ?? undefined,
      });
    }

    return this.scheduleRepository.create(dto);
  }
}
