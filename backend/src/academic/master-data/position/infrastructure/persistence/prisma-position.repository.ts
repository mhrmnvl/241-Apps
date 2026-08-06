import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/database/prisma.service.js';
import type {
  PositionQueryInput,
  CreatePositionRepositoryInput,
  UpdatePositionRepositoryInput,
} from '../../domain/interfaces/position-repository.interface.js';
import { IPositionRepository } from '../../domain/interfaces/position-repository.interface.js';
import { POSITION_WITH_CATEGORY_INCLUDE } from './prisma-position.includes.js';

@Injectable()
export class PrismaPositionRepository extends IPositionRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(query: PositionQueryInput) {
    const { page = 1, limit = 10, search, categoryId, isActive } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PositionWhereInput = {
      deletedAt: null,
      ...(categoryId && { categoryId }),
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        name: { contains: search, mode: 'insensitive' },
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.position.findMany({
        where,
        include: POSITION_WITH_CATEGORY_INCLUDE,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.position.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string) {
    return this.prisma.position.findFirst({
      where: { id, deletedAt: null },
      include: POSITION_WITH_CATEGORY_INCLUDE,
    });
  }

  async findByName(name: string, excludeId?: string) {
    return this.prisma.position.findFirst({
      where: {
        deletedAt: null,
        name: { equals: name, mode: 'insensitive' },
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
  }

  async findByCode(code: string, excludeId?: string) {
    return this.findByName(code, excludeId);
  }

  async create(dto: CreatePositionRepositoryInput) {
    return this.prisma.position.create({
      data: {
        ...dto,
      },
      include: POSITION_WITH_CATEGORY_INCLUDE,
    });
  }

  async update(id: string, dto: UpdatePositionRepositoryInput) {
    return this.prisma.position.update({
      where: { id },
      data: dto,
      include: POSITION_WITH_CATEGORY_INCLUDE,
    });
  }

  async remove(id: string) {
    return this.prisma.position.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async countTeachersWithPosition(id: string) {
    return this.prisma.teacherPosition.count({
      where: { positionId: id, deletedAt: null },
    });
  }

  async countActiveAssignments(id: string) {
    return this.countTeachersWithPosition(id);
  }
}
