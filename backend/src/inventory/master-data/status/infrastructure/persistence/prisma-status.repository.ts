import { Injectable } from '@nestjs/common';
import { InventoryStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/database/prisma.service.js';
import { IStatusRepository } from '../../domain/interfaces/status-repository.interface.js';

@Injectable()
export class StatusRepository extends IStatusRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findMany(search?: string): Promise<InventoryStatus[]> {
    const where: Prisma.InventoryStatusWhereInput = {};
    if (search && search.trim() !== '') {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.inventoryStatus.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<InventoryStatus | null> {
    return this.prisma.inventoryStatus.findUnique({
      where: { id },
    });
  }

  async create(
    data: Prisma.InventoryStatusCreateInput,
  ): Promise<InventoryStatus> {
    return this.prisma.inventoryStatus.create({ data });
  }

  async update(
    id: string,
    data: Prisma.InventoryStatusUpdateInput,
  ): Promise<InventoryStatus> {
    return this.prisma.inventoryStatus.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<InventoryStatus> {
    return this.prisma.inventoryStatus.delete({
      where: { id },
    });
  }
}
