import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service.js';
import { IAssetUnitRepository } from '../domain/interfaces/asset-unit-repository.interface.js';
import { CreateUnitsDto } from '../dto/request/create-units.dto.js';

@Injectable()
export class AddUnitsUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly unitRepo: IAssetUnitRepository,
  ) {}

  async execute(assetId: string, dto: CreateUnitsDto) {
    const asset = await this.prisma.inventoryAsset.findFirst({
      where: { id: assetId, deletedAt: null },
    });
    if (!asset) {
      throw new NotFoundException(`Asset with ID ${assetId} not found`);
    }
    const quantity = dto.quantity && dto.quantity > 0 ? dto.quantity : 1;

    const latest = await this.unitRepo.findLatestUnit(assetId);
    let start = 0;
    if (latest) {
      const suffix = latest.unitNumber.split('-').pop();
      start = parseInt(suffix ?? '', 10) || 0;
    }

    const rows = Array.from({ length: quantity }, (_, i) => {
      const n = start + i + 1;
      const unitNumber = `${asset.assetNumber}-${n.toString().padStart(2, '0')}`;
      return {
        assetId,
        unitNumber,
        barcode: unitNumber,
        currentBookValue: asset.purchasePrice,
        conditionId: dto.conditionId,
        statusId: dto.statusId,
        locationId: dto.locationId,
      };
    });

    await this.unitRepo.createMany(rows);
    return this.unitRepo.findByAsset(assetId);
  }
}
