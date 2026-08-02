import { Injectable } from '@nestjs/common';
import { Religion, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/database/prisma.service.js';
import { ReligionQueryInput } from '../../domain/interfaces/religion-repository.interface.js';
import { IReligionRepository } from '../../domain/interfaces/religion-repository.interface.js';
import { PaginatedResult } from '../../../../../shared/domain/interfaces/repository.interface.js';

@Injectable()
export class PrismaReligionRepository extends IReligionRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(query: ReligionQueryInput): Promise<PaginatedResult<Religion>> {
    const { page = 1, limit = 10, search, isActive } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ReligionWhereInput = {
      deletedAt: null,
      ...(isActive !== undefined && { isActive }),
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
    };

    const [data, total] = await Promise.all([
      this.prisma.religion.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.religion.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<Religion | null> {
    return this.prisma.religion.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByName(name: string, excludeId?: string): Promise<Religion | null> {
    return this.prisma.religion.findFirst({
      where: {
        name,
        deletedAt: null,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
  }

  async create(data: { name: string; isActive?: boolean }): Promise<Religion> {
    return this.prisma.religion.create({ data });
  }

  async update(
    id: string,
    data: Prisma.ReligionUpdateInput,
  ): Promise<Religion> {
    return this.prisma.religion.update({ where: { id }, data });
  }

  async softDelete(id: string): Promise<Religion> {
    return this.prisma.religion.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}
