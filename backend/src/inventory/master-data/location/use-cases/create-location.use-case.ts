import { Injectable } from '@nestjs/common';
import { ILocationRepository } from '../domain/interfaces/location-repository.interface.js';
import { CreateLocationDto } from '../dto/request/create-location.dto.js';

@Injectable()
export class CreateLocationUseCase {
  constructor(private readonly locationRepository: ILocationRepository) {}

  async execute(dto: CreateLocationDto) {
    return this.locationRepository.create({
      code: dto.code,
      name: dto.name,
      building: dto.building ?? null,
      room: dto.room ?? null,
      rack: dto.rack ?? null,
      description: dto.description ?? null,
    });
  }
}
