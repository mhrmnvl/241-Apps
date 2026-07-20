import { Injectable, NotFoundException } from '@nestjs/common';
import { ILocationRepository } from '../domain/interfaces/location-repository.interface.js';
import { UpdateLocationDto } from '../dto/request/location.dto.js';

@Injectable()
export class UpdateLocationUseCase {
  constructor(private readonly repository: ILocationRepository) {}

  async execute(id: string, dto: UpdateLocationDto) {
    const location = await this.repository.findById(id);
    if (!location) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }
    return this.repository.update(id, {
      code: dto.code,
      name: dto.name,
      building: dto.building ?? null,
      room: dto.room ?? null,
      rack: dto.rack ?? null,
      description: dto.description ?? null,
    });
  }
}
