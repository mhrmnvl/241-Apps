import { Injectable } from '@nestjs/common';
import { InventoryAssetUnit, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { IAssetUnitRepository } from '../../domain/interfaces/asset-unit-repository.interface.js';

const UNIT_INCLUDE = {
  condition: true,
  status: true,
  location: true,
} satisfies Prisma.InventoryAssetUnitInclude;

@Injectable()
export class PrismaAssetUnitRepository extends IAssetUnitRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findById(id: string): Promise<InventoryAssetUnit | null> {
    return this.prisma.inventoryAssetUnit.findFirst({
      where: { id, deletedAt: null },
      include: UNIT_INCLUDE,
    });
  }

  async findByAsset(assetId: string): Promise<InventoryAssetUnit[]> {
    return this.prisma.inventoryAssetUnit.findMany({
      where: { assetId, deletedAt: null },
      orderBy: { unitNumber: 'asc' },
      include: UNIT_INCLUDE,
    });
  }

  async findLatestUnit(assetId: string): Promise<InventoryAssetUnit | null> {
    return this.prisma.inventoryAssetUnit.findFirst({
      where: { assetId },
      orderBy: { unitNumber: 'desc' },
    });
  }

  async createMany(
    data: Prisma.InventoryAssetUnitCreateManyInput[],
  ): Promise<number> {
    const result = await this.prisma.inventoryAssetUnit.createMany({ data });
    return result.count;
  }

  async update(
    id: string,
    data: Prisma.InventoryAssetUnitUpdateInput,
  ): Promise<InventoryAssetUnit> {
    return this.prisma.inventoryAssetUnit.update({
      where: { id },
      data,
      include: UNIT_INCLUDE,
    });
  }

  async softDelete(id: string): Promise<InventoryAssetUnit> {
    return this.prisma.inventoryAssetUnit.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
