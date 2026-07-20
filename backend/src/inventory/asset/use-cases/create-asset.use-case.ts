import { Injectable } from '@nestjs/common';
import { IAssetRepository } from '../domain/interfaces/asset-repository.interface.js';
import { CreateAssetDto } from '../dto/request/create-asset.dto.js';
import { PrismaService } from '../../../core/database/prisma.service.js';

@Injectable()
export class CreateAssetUseCase {
  constructor(
    private readonly repository: IAssetRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(dto: CreateAssetDto) {
    const category = await this.prisma.inventoryCategory.findUnique({
      where: { id: dto.categoryId },
    });
    const catCode = category ? category.code.toUpperCase() : 'GEN';
    const purchaseYear = new Date(dto.purchaseDate).getFullYear();
    const prefix = `AST-${catCode}/${purchaseYear}/`;

    const latestAsset = await this.prisma.inventoryAsset.findFirst({
      where: {
        assetNumber: { startsWith: prefix },
      },
      orderBy: { assetNumber: 'desc' },
    });

    let nextSeq = 1;
    if (latestAsset) {
      const lastPart = latestAsset.assetNumber.split('/').pop();
      nextSeq = (parseInt(lastPart ?? '', 10) || 0) + 1;
    }
    const seqStr = nextSeq.toString().padStart(4, '0');
    // Blank/omitted asset number & barcode fall back to the generated value.
    const assetNumber =
      dto.assetNumber && dto.assetNumber.length > 0
        ? dto.assetNumber
        : `${prefix}${seqStr}`;
    const barcode =
      dto.barcode && dto.barcode.length > 0 ? dto.barcode : assetNumber;

    return this.repository.create({
      assetNumber,
      barcode,
      name: dto.name,
      brand: dto.brand ?? null,
      model: dto.model ?? null,
      serialNumber: dto.serialNumber ?? null,
      purchaseDate: new Date(dto.purchaseDate),
      purchasePrice: dto.purchasePrice,
      currentBookValue: dto.purchasePrice,
      usefulLifeMonths: dto.usefulLifeMonths ?? undefined,
      notes: dto.notes ?? null,
      category: { connect: { id: dto.categoryId } },
      location: { connect: { id: dto.locationId } },
      status: { connect: { id: dto.statusId } },
      condition: { connect: { id: dto.conditionId } },
      ...(dto.fundingSourceId && {
        fundingSource: { connect: { id: dto.fundingSourceId } },
      }),
    });
  }
}
