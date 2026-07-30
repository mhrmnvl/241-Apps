import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IEventRepository } from '../domain/interfaces/events-repository.interface.js';

@Injectable()
export class DeleteEventUseCase {
  private readonly logger = new Logger(DeleteEventUseCase.name);

  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(id: string): Promise<void> {
    const event = await this.eventRepository.findById(id);
    if (!event) throw new NotFoundException(`Event with ID ${id} not found`);

    await this.eventRepository.softDelete(id);
    this.logger.log(`Event soft-deleted: ${id}`);
  }
}
