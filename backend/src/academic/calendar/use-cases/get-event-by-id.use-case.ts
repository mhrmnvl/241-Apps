import { Injectable, NotFoundException } from '@nestjs/common';
import { IEventsRepository } from '../domain/interfaces/events-repository.interface.js';

@Injectable()
export class GetEventByIdUseCase {
  constructor(private readonly repository: IEventsRepository) {}

  async execute(id: string) {
    const event = await this.repository.findById(id);
    if (!event) throw new NotFoundException(`Event with ID ${id} not found`);
    return event;
  }
}
