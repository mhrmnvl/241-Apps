import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateScheduleDto } from '../dto/request/schedule.dto.js';
import { IScheduleRepository } from '../domain/interfaces/schedule-repository.interface.js';

@Injectable()
export class UpdateScheduleUseCase {
  constructor(private readonly scheduleRepository: IScheduleRepository) {}
  async execute(id: string, dto: UpdateScheduleDto) {
    const current = await this.scheduleRepository.findById(id);
    if (!current) throw new NotFoundException(`Schedule ${id} not found`);
    const taId = dto.teachingAssignmentId ?? current.teachingAssignmentId;
    const day = dto.day ?? current.day;
    const tsId = dto.timeSlotId ?? current.timeSlotId;
    if (
      taId !== current.teachingAssignmentId ||
      day !== current.day ||
      tsId !== current.timeSlotId
    ) {
      const dup = await this.scheduleRepository.findDuplicate(
        taId,
        day,
        tsId,
        id,
      );
      if (dup) throw new ConflictException('Schedule already exists');
    }
    return this.scheduleRepository.update(id, dto);
  }
}
