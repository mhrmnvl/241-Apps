import { Injectable, NotFoundException } from '@nestjs/common';
import { IScheduleRepository } from '../domain/interfaces/schedule-repository.interface.js';

@Injectable()
export class GetScheduleByIdUseCase {
  constructor(private readonly scheduleRepository: IScheduleRepository) {}
  async execute(id: string) {
    const r = await this.scheduleRepository.findById(id);
    if (!r) throw new NotFoundException(`Schedule ${id} not found`);
    return r;
  }
}
