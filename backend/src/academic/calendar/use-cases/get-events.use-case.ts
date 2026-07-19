import { Injectable } from '@nestjs/common';
import { EventQueryDto } from '../dto/event-query.dto.js';
import { IEventsRepository } from '../domain/interfaces/events-repository.interface.js';

@Injectable()
export class GetEventsUseCase {
  constructor(private readonly repository: IEventsRepository) {}

  async execute(query: EventQueryDto) {
    const { data, total, page, limit } = await this.repository.findAll(query);
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
