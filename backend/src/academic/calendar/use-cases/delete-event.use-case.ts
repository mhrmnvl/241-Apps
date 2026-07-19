import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IEventsRepository } from '../domain/interfaces/events-repository.interface.js';

@Injectable()
export class DeleteEventUseCase {
  private readonly logger = new Logger(DeleteEventUseCase.name);

  constructor(private readonly repository: IEventsRepository) {}

  async execute(id: string): Promise<void> {
    const event = await this.repository.findById(id);
    if (!event) throw new NotFoundException(`Event with ID ${id} not found`);

    await this.repository.softDelete(id);
    this.logger.log(`Event soft-deleted: ${id}`);
  }
}
