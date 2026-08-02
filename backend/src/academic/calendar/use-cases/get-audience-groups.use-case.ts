import { Injectable } from '@nestjs/common';
import { IEventRepository } from '../domain/interfaces/event-repository.interface.js';

@Injectable()
export class GetAudienceGroupsUseCase {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute() {
    return this.eventRepository.findAllAudienceGroups();
  }
}
