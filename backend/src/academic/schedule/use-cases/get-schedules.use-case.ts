import { Injectable } from '@nestjs/common';
import { ScheduleQueryDto } from '../dto/request/schedule-query.dto.js';
import { IScheduleRepository } from '../domain/interfaces/schedule-repository.interface.js';

@Injectable()
export class GetSchedulesUseCase {
  constructor(private readonly scheduleRepository: IScheduleRepository) {}
  async execute(query: ScheduleQueryDto) {
    return this.scheduleRepository.findAll({
      page: query.page,
      limit: query.limit,
      teachingAssignmentId: query.teachingAssignmentId,
      timeSlotId: query.timeSlotId,
      day: query.day,
    });
  }
}
