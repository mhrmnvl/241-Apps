import { Injectable } from '@nestjs/common';
import { ScheduleQueryDto } from '../dto/request/schedule.dto.js';
import { IScheduleRepository } from '../domain/interfaces/schedule-repository.interface.js';

@Injectable()
export class GetSchedulesUseCase {
  constructor(private readonly repository: IScheduleRepository) {}
  async execute(query: ScheduleQueryDto) {
    return this.repository.findAll(query);
  }
}
