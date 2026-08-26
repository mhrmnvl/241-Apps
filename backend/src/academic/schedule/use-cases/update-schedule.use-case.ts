import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateScheduleDto } from '../dto/request/update-schedule.dto.js';
import { IScheduleRepository } from '../domain/interfaces/schedule-repository.interface.js';
import { IScheduleLookupRepository } from '../domain/interfaces/schedule-lookup-repository.interface.js';
import { DayEnum } from '../../../shared/domain/enums/day.enum.js';
import { assertSlotIsFree } from '../services/assert-slot-is-free.js';

@Injectable()
export class UpdateScheduleUseCase {
  constructor(
    private readonly scheduleRepository: IScheduleRepository,
    private readonly lookupRepository: IScheduleLookupRepository,
  ) {}
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

      // Moving a lesson can walk it into another one. Excluding this row is
      // what keeps a move that changes only the room from colliding with
      // itself.
      const ta = await this.lookupRepository.findTeachingAssignmentById(taId);
      if (!ta) {
        throw new BadRequestException('Teaching assignment not found');
      }
      await assertSlotIsFree(
        this.scheduleRepository,
        {
          teacherId: ta.teacherId,
          classroomId: ta.classroomId,
          semesterId: ta.semesterId,
          timeSlotId: tsId,
          // The stored value is one of the enum's members; the entity types it
          // as a plain string, which is why this has to be said.
          day: day as DayEnum,
        },
        id,
      );
    }
    return this.scheduleRepository.update(id, {
      teachingAssignmentId: dto.teachingAssignmentId,
      timeSlotId: dto.timeSlotId,
      day: dto.day,
      room: dto.room,
    });
  }
}
