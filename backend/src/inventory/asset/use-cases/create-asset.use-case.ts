import { Injectable } from '@nestjs/common';
import { CreateAssetDto } from '../dto/request/create-asset.dto.js';
import {
  CreateAssetUnitSeedInput,
  IAssetRepository,
} from '../domain/interfaces/asset-repository.interface.js';

@Injectable()
export class CreateAssetUseCase {
  constructor(private readonly assetRepository: IAssetRepository) {}

  async execute(dto: CreateAssetDto) {
    const quantity = dto.quantity && dto.quantity > 0 ? dto.quantity : 1;

    const category = await this.assetRepository.findCategoryById(
      dto.categoryId,
    );
    const catCode = category ? category.code.toUpperCase() : 'GEN';
    const year = new Date(dto.purchaseDate).getFullYear();
    const prefix = `AST-${catCode}/${year}/`;

    // Next parent (batch) sequence, 3 digits, scoped to category+year prefix.
    const latestParent =
      await this.assetRepository.findLatestAssetByPrefix(prefix);
    let seq = 1;
    if (latestParent) {
      const lastPart = latestParent.assetNumber.split('/').pop();
      seq = (parseInt(lastPart ?? '', 10) || 0) + 1;
    }
    const assetNumber = `${prefix}${seq.toString().padStart(3, '0')}`;

    // Units: assetNumber + '-NN'.
    const units: CreateAssetUnitSeedInput[] = Array.from(
      { length: quantity },
      (_, idx) => {
        const n = idx + 1;
        const unitNumber = `${assetNumber}-${n.toString().padStart(2, '0')}`;
        return {
          unitNumber,
          barcode:
            quantity === 1 && dto.barcode && dto.barcode.length > 0
              ? dto.barcode
              : unitNumber,
          currentBookValue: dto.purchasePrice,
          conditionId: dto.conditionId,
          statusId: dto.statusId,
          locationId: dto.locationId,
        };
      },
    );

    return this.assetRepository.create({
      assetNumber,
      name: dto.name,
      brand: dto.brand ?? null,
      model: dto.model ?? null,
      purchaseDate: new Date(dto.purchaseDate),
      purchasePrice: dto.purchasePrice,
      usefulLifeMonths: dto.usefulLifeMonths ?? undefined,
      notes: dto.notes ?? null,
      categoryId: dto.categoryId,
      fundingSourceId: dto.fundingSourceId ?? undefined,
      units,
    });
  }
}
