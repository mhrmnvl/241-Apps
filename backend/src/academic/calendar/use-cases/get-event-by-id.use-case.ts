import { Injectable, NotFoundException } from '@nestjs/common';
import { IEventRepository } from '../domain/interfaces/events-repository.interface.js';

@Injectable()
export class GetEventByIdUseCase {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(id: string) {
    const event = await this.eventRepository.findById(id);
    if (!event) throw new NotFoundException(`Event with ID ${id} not found`);
    return event;
  }
}
