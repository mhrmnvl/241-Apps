import { Injectable } from '@nestjs/common';
import { ILocationRepository } from '../domain/interfaces/location-repository.interface.js';
import { CreateLocationDto } from '../dto/location.dto.js';

@Injectable()
export class CreateLocationUseCase {
  constructor(private readonly repository: ILocationRepository) {}

  async execute(dto: CreateLocationDto) {
    return this.repository.create({
      code: dto.code,
      name: dto.name,
      building: dto.building ?? null,
      room: dto.room ?? null,
      rack: dto.rack ?? null,
      description: dto.description ?? null,
    });
  }
}
