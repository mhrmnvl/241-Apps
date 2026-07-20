import { Injectable } from '@nestjs/common';
import { AchievementType, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/database/prisma.service.js';
import { AchievementTypeQueryDto } from '../../dto/request/achievement-type-query.dto.js';
import { IAchievementTypeRepository } from '../../domain/interfaces/achievement-type-repository.interface.js';
import { PaginatedResult } from '../../../../../shared/domain/interfaces/repository.interface.js';

@Injectable()
export class PrismaAchievementTypeRepository extends IAchievementTypeRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(
    query: AchievementTypeQueryDto,
  ): Promise<PaginatedResult<AchievementType>> {
    const { page = 1, limit = 10, search, isActive } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.AchievementTypeWhereInput = {
      deletedAt: null,
      ...(isActive !== undefined && { isActive }),
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
    };

    const [data, total] = await Promise.all([
      this.prisma.achievementType.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.achievementType.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<AchievementType | null> {
    return this.prisma.achievementType.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByName(
    name: string,
    excludeId?: string,
  ): Promise<AchievementType | null> {
    return this.prisma.achievementType.findFirst({
      where: {
        name,
        deletedAt: null,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
  }

  async create(data: {
    name: string;
    isActive?: boolean;
  }): Promise<AchievementType> {
    return this.prisma.achievementType.create({ data });
  }

  async update(
    id: string,
    data: Prisma.AchievementTypeUpdateInput,
  ): Promise<AchievementType> {
    return this.prisma.achievementType.update({ where: { id }, data });
  }

  async softDelete(id: string): Promise<AchievementType> {
    return this.prisma.achievementType.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}
