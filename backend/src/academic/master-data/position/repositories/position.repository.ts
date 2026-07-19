import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { CreatePositionDto } from '../dto/create-position.dto.js';
import { UpdatePositionDto } from '../dto/update-position.dto.js';
import { PositionQueryDto } from '../dto/position-query.dto.js';
import {
  IPositionRepository,
  POSITION_INCLUDE,
} from '../interfaces/position-repository.interface.js';

@Injectable()
export class PositionRepository implements IPositionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PositionQueryDto) {
    const { page = 1, limit = 10, search, categoryId, isActive } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.PositionWhereInput = {
      deletedAt: null,
      ...(categoryId && { categoryId }),
      ...(isActive !== undefined && { isActive }),
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
    };

    const [data, total] = await Promise.all([
      this.prisma.position.findMany({
        where,
        include: POSITION_INCLUDE,
        skip,
        take: limit,
        orderBy: [{ category: { code: 'asc' } }, { name: 'asc' }],
      }),
      this.prisma.position.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string) {
    return this.prisma.position.findFirst({
      where: { id, deletedAt: null },
      include: POSITION_INCLUDE,
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

  async create(dto: CreatePositionDto) {
    return this.prisma.position.create({ data: dto });
  }

  async update(id: string, dto: UpdatePositionDto) {
    return this.prisma.position.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    return this.prisma.position.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async countActiveAssignments(positionId: string) {
    return this.prisma.teacherPosition.count({ where: { positionId } });
  }
}
