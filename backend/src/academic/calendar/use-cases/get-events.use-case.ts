import { Injectable } from '@nestjs/common';
import { EventQueryDto } from '../dto/request/event-query.dto.js';
import { IEventRepository } from '../domain/interfaces/events-repository.interface.js';

@Injectable()
export class GetEventsUseCase {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(query: EventQueryDto) {
    const { data, total, page, limit } =
      await this.eventRepository.findAll(query);
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
