import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateAssetDto } from '../dto/request/create-asset.dto.js';
import { IAssetRepository } from '../domain/interfaces/asset-repository.interface.js';

@Injectable()
export class CreateAssetUseCase {
  constructor(private readonly repository: IAssetRepository) {}

  async execute(dto: CreateAssetDto) {
    const quantity = dto.quantity && dto.quantity > 0 ? dto.quantity : 1;

    const category = await this.repository.findCategoryById(dto.categoryId);
    const catCode = category ? category.code.toUpperCase() : 'GEN';
    const year = new Date(dto.purchaseDate).getFullYear();
    const prefix = `AST-${catCode}/${year}/`;

    // Next parent (batch) sequence, 3 digits, scoped to category+year prefix.
    const latestParent = await this.repository.findLatestAssetByPrefix(prefix);
    let seq = 1;
    if (latestParent) {
      const lastPart = latestParent.assetNumber.split('/').pop();
      seq = (parseInt(lastPart ?? '', 10) || 0) + 1;
    }
    const assetNumber = `${prefix}${seq.toString().padStart(3, '0')}`;

    // Units: assetNumber + '-NN'.
    const units: Prisma.InventoryAssetUnitCreateWithoutAssetInput[] =
      Array.from({ length: quantity }, (_, idx) => {
        const n = idx + 1;
        const unitNumber = `${assetNumber}-${n.toString().padStart(2, '0')}`;
        return {
          unitNumber,
          barcode:
            quantity === 1 && dto.barcode && dto.barcode.length > 0
              ? dto.barcode
              : unitNumber,
          currentBookValue: dto.purchasePrice,
          condition: { connect: { id: dto.conditionId } },
          status: { connect: { id: dto.statusId } },
          location: { connect: { id: dto.locationId } },
        };
      });

    return this.repository.create({
      data: {
        assetNumber,
        name: dto.name,
        brand: dto.brand ?? null,
        model: dto.model ?? null,
        purchaseDate: new Date(dto.purchaseDate),
        purchasePrice: dto.purchasePrice,
        usefulLifeMonths: dto.usefulLifeMonths ?? undefined,
        notes: dto.notes ?? null,
        category: { connect: { id: dto.categoryId } },
        ...(dto.fundingSourceId && {
          fundingSource: { connect: { id: dto.fundingSourceId } },
        }),
        units: { create: units },
      },
      include: {
        category: true,
        fundingSource: true,
        units: {
          where: { deletedAt: null },
          include: { condition: true, status: true, location: true },
        },
      },
    });
  }
}
