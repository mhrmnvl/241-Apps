import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import {
  CreatePositionCategoryDto,
  UpdatePositionCategoryDto,
} from '../dto/create-position-category.dto.js';
import { PositionCategoryQueryDto } from '../dto/position-category-query.dto.js';
import { IPositionCategoryRepository } from '../interfaces/position-category-repository.interface.js';

@Injectable()
export class PositionCategoryRepository implements IPositionCategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PositionCategoryQueryDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PositionCategoryWhereInput = {
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.positionCategory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { code: 'asc' },
      }),
      this.prisma.positionCategory.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string) {
    return this.prisma.positionCategory.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByCode(code: string, excludeId?: string) {
    return this.prisma.positionCategory.findFirst({
      where: {
        deletedAt: null,
        code: { equals: code, mode: 'insensitive' },
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
  }

  async create(dto: CreatePositionCategoryDto) {
    return this.prisma.positionCategory.create({
      data: dto,
    });
  }

  async update(id: string, dto: UpdatePositionCategoryDto) {
    return this.prisma.positionCategory.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    return this.prisma.positionCategory.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async countPositionsWithCategory(id: string) {
    return this.prisma.position.count({
      where: { categoryId: id, deletedAt: null },
    });
  }
}
