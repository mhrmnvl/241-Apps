import { Injectable } from '@nestjs/common';
import { InventoryCategory, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/database/prisma.service.js';
import { ICategoryRepository } from '../../domain/interfaces/category-repository.interface.js';

@Injectable()
export class CategoryRepository extends ICategoryRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findMany(search?: string): Promise<InventoryCategory[]> {
    const where: Prisma.InventoryCategoryWhereInput = {};
    if (search && search.trim() !== '') {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.inventoryCategory.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<InventoryCategory | null> {
    return this.prisma.inventoryCategory.findUnique({
      where: { id },
    });
  }

  async create(
    data: Prisma.InventoryCategoryCreateInput,
  ): Promise<InventoryCategory> {
    return this.prisma.inventoryCategory.create({ data });
  }

  async update(
    id: string,
    data: Prisma.InventoryCategoryUpdateInput,
  ): Promise<InventoryCategory> {
    return this.prisma.inventoryCategory.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<InventoryCategory> {
    return this.prisma.inventoryCategory.delete({
      where: { id },
    });
  }
}
