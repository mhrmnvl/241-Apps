import { Injectable } from '@nestjs/common';
import { InventoryFundingSource, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/database/prisma.service.js';
import { IFundingSourceRepository } from '../../domain/interfaces/funding-source-repository.interface.js';

@Injectable()
export class FundingSourceRepository extends IFundingSourceRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findMany(search?: string): Promise<InventoryFundingSource[]> {
    const where: Prisma.InventoryFundingSourceWhereInput = {};
    if (search && search.trim() !== '') {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.inventoryFundingSource.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<InventoryFundingSource | null> {
    return this.prisma.inventoryFundingSource.findUnique({
      where: { id },
    });
  }

  async create(
    data: Prisma.InventoryFundingSourceCreateInput,
  ): Promise<InventoryFundingSource> {
    return this.prisma.inventoryFundingSource.create({ data });
  }

  async update(
    id: string,
    data: Prisma.InventoryFundingSourceUpdateInput,
  ): Promise<InventoryFundingSource> {
    return this.prisma.inventoryFundingSource.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<InventoryFundingSource> {
    return this.prisma.inventoryFundingSource.delete({
      where: { id },
    });
  }
}
