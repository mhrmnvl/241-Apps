import { Injectable, NotFoundException } from '@nestjs/common';
import { ILocationRepository } from '../domain/interfaces/location-repository.interface.js';

@Injectable()
export class DeleteLocationUseCase {
  constructor(private readonly locationRepository: ILocationRepository) {}

  async execute(id: string) {
    const location = await this.locationRepository.findById(id);
    if (!location) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }
    return this.locationRepository.delete(id);
  }
}
