import { Injectable } from '@nestjs/common';
import { InventoryLocation, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/database/prisma.service.js';
import { ILocationRepository } from '../../domain/interfaces/location-repository.interface.js';

@Injectable()
export class LocationRepository extends ILocationRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findMany(search?: string): Promise<InventoryLocation[]> {
    const where: Prisma.InventoryLocationWhereInput = {};
    if (search && search.trim() !== '') {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.inventoryLocation.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<InventoryLocation | null> {
    return this.prisma.inventoryLocation.findUnique({
      where: { id },
    });
  }

  async create(
    data: Prisma.InventoryLocationCreateInput,
  ): Promise<InventoryLocation> {
    return this.prisma.inventoryLocation.create({ data });
  }

  async update(
    id: string,
    data: Prisma.InventoryLocationUpdateInput,
  ): Promise<InventoryLocation> {
    return this.prisma.inventoryLocation.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<InventoryLocation> {
    return this.prisma.inventoryLocation.delete({
      where: { id },
    });
  }
}
