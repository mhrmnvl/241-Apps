import { Injectable, NotFoundException } from '@nestjs/common';
import { IScheduleRepository } from '../domain/interfaces/schedule-repository.interface.js';

@Injectable()
export class DeleteScheduleUseCase {
  constructor(private readonly repo: IScheduleRepository) {}
  async execute(id: string) {
    const r = await this.repo.findById(id);
    if (!r) throw new NotFoundException(`Schedule ${id} not found`);
    return this.repo.softDelete(id);
  }
}
