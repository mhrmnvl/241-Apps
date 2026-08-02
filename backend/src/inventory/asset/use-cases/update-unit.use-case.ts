import { Injectable, NotFoundException } from '@nestjs/common';
import { IAssetUnitRepository } from '../domain/interfaces/asset-unit-repository.interface.js';
import { UpdateUnitDto } from '../dto/request/update-unit.dto.js';

@Injectable()
export class UpdateUnitUseCase {
  constructor(private readonly unitRepository: IAssetUnitRepository) {}

  async execute(id: string, dto: UpdateUnitDto) {
    const unit = await this.unitRepository.findById(id);
    if (!unit) {
      throw new NotFoundException(`Asset unit with ID ${id} not found`);
    }
    return this.unitRepository.update(id, {
      barcode: dto.barcode ?? undefined,
      notes: dto.notes ?? undefined,
      custodianId: dto.custodianId ?? undefined,
      conditionId: dto.conditionId,
      statusId: dto.statusId,
      locationId: dto.locationId,
    });
  }
}
