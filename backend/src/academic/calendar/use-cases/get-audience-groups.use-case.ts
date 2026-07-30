import { Injectable } from '@nestjs/common';
import { IEventsRepository } from '../domain/interfaces/events-repository.interface.js';

@Injectable()
export class GetAudienceGroupsUseCase {
  constructor(private readonly repo: IEventsRepository) {}

  async execute() {
    return this.repo.findAllAudienceGroups();
  }
}
