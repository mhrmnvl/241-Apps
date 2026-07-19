import { Injectable } from '@nestjs/common';
import { InventoryCondition, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/database/prisma.service.js';
import { IConditionRepository } from '../../domain/interfaces/condition-repository.interface.js';

@Injectable()
export class ConditionRepository extends IConditionRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findMany(search?: string): Promise<InventoryCondition[]> {
    const where: Prisma.InventoryConditionWhereInput = {};
    if (search && search.trim() !== '') {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.inventoryCondition.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<InventoryCondition | null> {
    return this.prisma.inventoryCondition.findUnique({
      where: { id },
    });
  }

  async create(
    data: Prisma.InventoryConditionCreateInput,
  ): Promise<InventoryCondition> {
    return this.prisma.inventoryCondition.create({ data });
  }

  async update(
    id: string,
    data: Prisma.InventoryConditionUpdateInput,
  ): Promise<InventoryCondition> {
    return this.prisma.inventoryCondition.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<InventoryCondition> {
    return this.prisma.inventoryCondition.delete({
      where: { id },
    });
  }
}
