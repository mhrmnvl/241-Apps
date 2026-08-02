import { toNumericValue } from '../../../../shared/domain/types/decimal.type.js';
import { Injectable } from '@nestjs/common';
import { InventoryAssetUnit, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import {
  AssetUnitQueryInput,
  CreateAssetUnitRepositoryInput,
  IAssetUnitRepository,
  UpdateAssetUnitRepositoryInput,
} from '../../domain/interfaces/asset-unit-repository.interface.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';
import {
  AssetUnitWithDetails,
  InventoryAssetUnitEntity,
} from '../../domain/entities/asset.entity.js';

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

  async findAll(
    query: AssetUnitQueryInput,
  ): Promise<PaginatedResult<AssetUnitWithDetails>> {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.inventoryAssetUnit.findMany({
        where: { deletedAt: null },
        skip,
        take: limit,
        include: UNIT_INCLUDE,
      }),
      this.prisma.inventoryAssetUnit.count({ where: { deletedAt: null } }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<AssetUnitWithDetails | null> {
    return this.prisma.inventoryAssetUnit.findFirst({
      where: { id, deletedAt: null },
      include: UNIT_INCLUDE,
    });
  }

  async findByUnitCode(
    unitCode: string,
    excludeId?: string,
  ): Promise<InventoryAssetUnitEntity | null> {
    return this.prisma.inventoryAssetUnit.findFirst({
      where: {
        unitNumber: unitCode,
        deletedAt: null,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
  }

  async findByBarcode(
    barcode: string,
    excludeId?: string,
  ): Promise<InventoryAssetUnitEntity | null> {
    return this.prisma.inventoryAssetUnit.findFirst({
      where: {
        barcode,
        deletedAt: null,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
  }

  async findByAsset(assetId: string): Promise<AssetUnitWithDetails[]> {
    return this.prisma.inventoryAssetUnit.findMany({
      where: { assetId, deletedAt: null },
      orderBy: { unitNumber: 'asc' },
      include: UNIT_INCLUDE,
    });
  }

  async findLatestUnit(
    assetId: string,
  ): Promise<InventoryAssetUnitEntity | null> {
    return this.prisma.inventoryAssetUnit.findFirst({
      where: { assetId },
      orderBy: { unitNumber: 'desc' },
    });
  }

  async create(
    input: CreateAssetUnitRepositoryInput,
  ): Promise<AssetUnitWithDetails> {
    return this.prisma.inventoryAssetUnit.create({
      data: {
        ...input,
        currentBookValue: toNumericValue(input.currentBookValue),
      },
      include: UNIT_INCLUDE,
    });
  }

  async createMany(data: CreateAssetUnitRepositoryInput[]): Promise<number> {
    const result = await this.prisma.inventoryAssetUnit.createMany({
      data: data.map((row) => ({
        ...row,
        currentBookValue: toNumericValue(row.currentBookValue),
      })),
    });
    return result.count;
  }

  async update(
    id: string,
    input: UpdateAssetUnitRepositoryInput,
  ): Promise<AssetUnitWithDetails> {
    const { conditionId, statusId, locationId, ...scalars } = input;

    const data: Prisma.InventoryAssetUnitUpdateInput = {
      ...scalars,
      ...(conditionId && { condition: { connect: { id: conditionId } } }),
      ...(statusId && { status: { connect: { id: statusId } } }),
      ...(locationId && { location: { connect: { id: locationId } } }),
    };

    return this.prisma.inventoryAssetUnit.update({
      where: { id },
      data,
      include: UNIT_INCLUDE,
    });
  }

  async remove(id: string): Promise<InventoryAssetUnitEntity> {
    return this.prisma.inventoryAssetUnit.delete({
      where: { id },
    });
  }

  async softDelete(id: string): Promise<InventoryAssetUnitEntity> {
    return this.prisma.inventoryAssetUnit.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
