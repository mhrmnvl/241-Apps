import { Injectable, NotFoundException } from '@nestjs/common';
import { IAssetRepository } from '../domain/interfaces/asset-repository.interface.js';
import { UpdateAssetDto } from '../dto/update-asset.dto.js';

@Injectable()
export class UpdateAssetUseCase {
  constructor(private readonly repository: IAssetRepository) {}

  async execute(id: string, dto: UpdateAssetDto) {
    const asset = await this.repository.findById(id);
    if (!asset) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }

    return this.repository.update(id, {
      name: dto.name,
      brand: dto.brand ?? undefined,
      model: dto.model ?? undefined,
      serialNumber: dto.serialNumber ?? undefined,
      barcode: dto.barcode,
      assetNumber: dto.assetNumber,
      purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : undefined,
      purchasePrice: dto.purchasePrice,
      usefulLifeMonths: dto.usefulLifeMonths ?? undefined,
      notes: dto.notes ?? undefined,
      category: dto.categoryId
        ? { connect: { id: dto.categoryId } }
        : undefined,
      location: dto.locationId
        ? { connect: { id: dto.locationId } }
        : undefined,
      status: dto.statusId ? { connect: { id: dto.statusId } } : undefined,
      condition: dto.conditionId
        ? { connect: { id: dto.conditionId } }
        : undefined,
      fundingSource: dto.fundingSourceId
        ? { connect: { id: dto.fundingSourceId } }
        : dto.fundingSourceId === null
          ? { disconnect: true }
          : undefined,
    });
  }
}
