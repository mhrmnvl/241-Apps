import { Injectable } from '@nestjs/common';
import { BloodType, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/database/prisma.service.js';
import { BloodTypeQueryDto } from '../../dto/request/blood-type-query.dto.js';
import { IBloodTypeRepository } from '../../domain/interfaces/blood-type-repository.interface.js';
import { PaginatedResult } from '../../../../../shared/domain/interfaces/repository.interface.js';

@Injectable()
export class PrismaBloodTypeRepository extends IBloodTypeRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(query: BloodTypeQueryDto): Promise<PaginatedResult<BloodType>> {
    const { page = 1, limit = 10, search, isActive } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.BloodTypeWhereInput = {
      deletedAt: null,
      ...(isActive !== undefined && { isActive }),
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
    };

    const [data, total] = await Promise.all([
      this.prisma.bloodType.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.bloodType.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<BloodType | null> {
    return this.prisma.bloodType.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByName(
    name: string,
    excludeId?: string,
  ): Promise<BloodType | null> {
    return this.prisma.bloodType.findFirst({
      where: {
        name,
        deletedAt: null,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
  }

  async create(data: { name: string; isActive?: boolean }): Promise<BloodType> {
    return this.prisma.bloodType.create({ data });
  }

  async update(
    id: string,
    data: Prisma.BloodTypeUpdateInput,
  ): Promise<BloodType> {
    return this.prisma.bloodType.update({ where: { id }, data });
  }

  async softDelete(id: string): Promise<BloodType> {
    return this.prisma.bloodType.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}
