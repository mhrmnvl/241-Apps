import { Injectable } from '@nestjs/common';
import { ILocationRepository } from '../domain/interfaces/location-repository.interface.js';

@Injectable()
export class GetLocationsUseCase {
  constructor(private readonly locationRepository: ILocationRepository) {}

  async execute(search?: string) {
    return this.locationRepository.findMany(search);
  }
}
