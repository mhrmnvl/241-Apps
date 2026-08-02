import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/database/prisma.service.js';
import type {
  PositionCategoryQueryInput,
  CreatePositionCategoryRepositoryInput,
  UpdatePositionCategoryRepositoryInput,
} from '../../domain/interfaces/position-category-repository.interface.js';
import { IPositionCategoryRepository } from '../../domain/interfaces/position-category-repository.interface.js';

@Injectable()
export class PrismaPositionCategoryRepository implements IPositionCategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query?: PositionCategoryQueryInput) {
    const search = query?.search;
    const where: Prisma.PositionCategoryWhereInput = {
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    return this.prisma.positionCategory.findMany({
      where,
      orderBy: { code: 'asc' },
    });
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

  async create(dto: CreatePositionCategoryRepositoryInput) {
    return this.prisma.positionCategory.create({
      data: dto,
    });
  }

  async update(id: string, dto: UpdatePositionCategoryRepositoryInput) {
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
