import { Injectable } from '@nestjs/common';
import { ILocationRepository } from '../domain/interfaces/location-repository.interface.js';

@Injectable()
export class GetLocationsUseCase {
  constructor(private readonly repository: ILocationRepository) {}

  async execute(search?: string) {
    return this.repository.findMany(search);
  }
}
