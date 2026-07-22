import { Injectable, NotFoundException } from '@nestjs/common';
import { IAssetUnitRepository } from '../domain/interfaces/asset-unit-repository.interface.js';

@Injectable()
export class DeleteUnitUseCase {
  constructor(private readonly unitRepo: IAssetUnitRepository) {}

  async execute(id: string) {
    const unit = await this.unitRepo.findById(id);
    if (!unit) {
      throw new NotFoundException(`Asset unit with ID ${id} not found`);
    }
    await this.unitRepo.softDelete(id);
  }
}
