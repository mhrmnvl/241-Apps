import { Injectable } from '@nestjs/common';
import { InventoryAsset, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { AssetQueryDto } from '../../dto/request/asset-query.dto.js';
import { IAssetRepository } from '../../domain/interfaces/asset-repository.interface.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

@Injectable()
export class PrismaAssetRepository extends IAssetRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(
    query: AssetQueryDto,
  ): Promise<PaginatedResult<InventoryAsset>> {
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

    // condition/status/location now live on units — filter parents with a matching unit.
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
        include: {
          category: true,
          fundingSource: true,
          units: {
            where: { deletedAt: null },
            include: { condition: true, status: true, location: true },
          },
        },
      }),
      this.prisma.inventoryAsset.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<InventoryAsset | null> {
    return this.prisma.inventoryAsset.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: true,
        fundingSource: true,
        units: {
          where: { deletedAt: null },
          orderBy: { unitNumber: 'asc' },
          include: { condition: true, status: true, location: true },
        },
      },
    });
  }

  async create(
    data: Prisma.InventoryAssetCreateInput,
  ): Promise<InventoryAsset> {
    return this.prisma.inventoryAsset.create({ data });
  }

  async update(
    id: string,
    data: Prisma.InventoryAssetUpdateInput,
  ): Promise<InventoryAsset> {
    return this.prisma.inventoryAsset.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<InventoryAsset> {
    return this.prisma.inventoryAsset.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findLatestAsset(): Promise<InventoryAsset | null> {
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
