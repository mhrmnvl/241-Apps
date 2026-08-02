import { Injectable, NotFoundException } from '@nestjs/common';
import { IAssetRepository } from '../domain/interfaces/asset-repository.interface.js';
import { UpdateAssetDto } from '../dto/request/update-asset.dto.js';

@Injectable()
export class UpdateAssetUseCase {
  constructor(private readonly assetRepository: IAssetRepository) {}

  async execute(id: string, dto: UpdateAssetDto) {
    const asset = await this.assetRepository.findById(id);
    if (!asset) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }

    return this.assetRepository.update(id, {
      name: dto.name,
      brand: dto.brand ?? undefined,
      model: dto.model ?? undefined,
      assetNumber: dto.assetNumber,
      purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : undefined,
      purchasePrice: dto.purchasePrice,
      usefulLifeMonths: dto.usefulLifeMonths ?? undefined,
      notes: dto.notes ?? undefined,
      categoryId: dto.categoryId,
      fundingSourceId: dto.fundingSourceId,
    });
  }
}
