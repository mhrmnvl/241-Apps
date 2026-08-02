import { toNumericValue } from '../../../../shared/domain/types/decimal.type.js';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { InventoryAssetEntity } from '../../domain/entities/asset.entity.js';
import {
  AssetQueryInput,
  CreateAssetRepositoryInput,
  IAssetRepository,
  UpdateAssetRepositoryInput,
} from '../../domain/interfaces/asset-repository.interface.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';
import {
  ASSET_WITH_DETAILS_INCLUDE,
  AssetWithDetails,
} from './prisma-asset.includes.js';

@Injectable()
export class PrismaAssetRepository extends IAssetRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(
    query: AssetQueryInput,
  ): Promise<PaginatedResult<AssetWithDetails>> {
    const {
      page = 1,
      limit = 10,
      keyword,
      categoryId,
      locationId,
      statusId,
      conditionId,
      fundingSourceId,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.InventoryAssetWhereInput = {
      deletedAt: null,
    };

    if (keyword && keyword.trim() !== '') {
      where.OR = [
        { name: { contains: keyword, mode: 'insensitive' } },
        { assetNumber: { contains: keyword, mode: 'insensitive' } },
        { brand: { contains: keyword, mode: 'insensitive' } },
        { model: { contains: keyword, mode: 'insensitive' } },
        {
          units: {
            some: { unitNumber: { contains: keyword, mode: 'insensitive' } },
          },
        },
        {
          units: {
            some: { barcode: { contains: keyword, mode: 'insensitive' } },
          },
        },
      ];
    }

    if (categoryId && categoryId !== 'all') {
      where.categoryId = categoryId;
    }
    if (fundingSourceId && fundingSourceId !== 'all') {
      where.fundingSourceId = fundingSourceId;
    }

    const unitFilter: Prisma.InventoryAssetUnitWhereInput = { deletedAt: null };
    if (locationId && locationId !== 'all') unitFilter.locationId = locationId;
    if (statusId && statusId !== 'all') unitFilter.statusId = statusId;
    if (conditionId && conditionId !== 'all')
      unitFilter.conditionId = conditionId;
    if (Object.keys(unitFilter).length > 1) {
      where.units = { some: unitFilter };
    }

    const [data, total] = await Promise.all([
      this.prisma.inventoryAsset.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: ASSET_WITH_DETAILS_INCLUDE,
      }),
      this.prisma.inventoryAsset.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<AssetWithDetails | null> {
    return this.prisma.inventoryAsset.findFirst({
      where: { id, deletedAt: null },
      include: ASSET_WITH_DETAILS_INCLUDE,
    });
  }

  async findByCode(code: string): Promise<InventoryAssetEntity | null> {
    return this.prisma.inventoryAsset.findFirst({
      where: { assetNumber: code, deletedAt: null },
      include: ASSET_WITH_DETAILS_INCLUDE,
    });
  }

  async create(input: CreateAssetRepositoryInput): Promise<AssetWithDetails> {
    const { categoryId, fundingSourceId, units, ...scalars } = input;

    const data: Prisma.InventoryAssetCreateInput = {
      ...scalars,
      category: { connect: { id: categoryId } },
      ...(fundingSourceId && {
        fundingSource: { connect: { id: fundingSourceId } },
      }),
      units: {
        create: units.map(
          ({ conditionId, statusId, locationId, ...unitScalars }) => ({
            ...unitScalars,
            currentBookValue: toNumericValue(unitScalars.currentBookValue),
            condition: { connect: { id: conditionId } },
            status: { connect: { id: statusId } },
            location: { connect: { id: locationId } },
          }),
        ),
      },
    };

    return this.prisma.inventoryAsset.create({
      data,
      include: ASSET_WITH_DETAILS_INCLUDE,
    });
  }

  async update(
    id: string,
    input: UpdateAssetRepositoryInput,
  ): Promise<AssetWithDetails> {
    const { categoryId, fundingSourceId, ...scalars } = input;

    const data: Prisma.InventoryAssetUpdateInput = {
      ...scalars,
      ...(categoryId && { category: { connect: { id: categoryId } } }),
      ...(fundingSourceId !== undefined && {
        fundingSource: fundingSourceId
          ? { connect: { id: fundingSourceId } }
          : { disconnect: true },
      }),
    };

    return this.prisma.inventoryAsset.update({
      where: { id },
      data,
      include: ASSET_WITH_DETAILS_INCLUDE,
    });
  }

  async remove(id: string): Promise<InventoryAssetEntity> {
    return this.prisma.inventoryAsset.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async softDelete(id: string): Promise<InventoryAssetEntity> {
    return this.prisma.inventoryAsset.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async countUnits(id: string): Promise<number> {
    return this.prisma.inventoryAssetUnit.count({
      where: { assetId: id, deletedAt: null },
    });
  }

  async findLatestAsset(): Promise<InventoryAssetEntity | null> {
    return this.prisma.inventoryAsset.findFirst({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findCategoryById(
    id: string,
  ): Promise<{ id: string; code: string } | null> {
    return this.prisma.inventoryCategory.findUnique({
      where: { id },
      select: { id: true, code: true },
    });
  }

  async findLatestAssetByPrefix(
    prefix: string,
  ): Promise<{ assetNumber: string } | null> {
    return this.prisma.inventoryAsset.findFirst({
      where: { assetNumber: { startsWith: prefix } },
      orderBy: { assetNumber: 'desc' },
      select: { assetNumber: true },
    });
  }
}
