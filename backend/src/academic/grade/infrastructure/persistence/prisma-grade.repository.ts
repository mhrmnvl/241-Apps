import { Injectable } from '@nestjs/common';
import { Grade, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import type {
  GradeQueryInput,
  CreateGradeRepositoryInput,
  UpdateGradeRepositoryInput,
} from '../../domain/interfaces/grade-repository.interface.js';
import { IGradeRepository } from '../../domain/interfaces/grade-repository.interface.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';
import { GradeEntity } from '../../domain/entities/grade.entity.js';

@Injectable()
export class PrismaGradeRepository extends IGradeRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(
    query?: GradeQueryInput,
  ): Promise<PaginatedResult<GradeEntity>> {
    const q = query ?? {};
    const { page = 1, limit = 10, search, isActive } = q;
    const skip = (page - 1) * limit;

    const where: Prisma.GradeWhereInput = {
      deletedAt: null,
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        name: { contains: search, mode: 'insensitive' },
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.grade.findMany({
        where,
        skip,
        take: limit,
        orderBy: { level: 'asc' },
      }),
      this.prisma.grade.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<GradeEntity | null> {
    return this.prisma.grade.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByLevel(level: number): Promise<GradeEntity | null> {
    return this.prisma.grade.findFirst({
      where: { level, deletedAt: null },
    });
  }

  async findByName(
    name: string,
    excludeId?: string,
  ): Promise<GradeEntity | null> {
    return this.prisma.grade.findFirst({
      where: {
        name,
        deletedAt: null,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
  }

  async create(dto: CreateGradeRepositoryInput): Promise<GradeEntity> {
    return this.prisma.grade.create({
      data: {
        level: dto.level,
        name: dto.name,
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async update(
    id: string,
    dto: UpdateGradeRepositoryInput,
  ): Promise<GradeEntity> {
    return this.prisma.grade.update({
      where: { id },
      data: {
        ...(dto.level !== undefined && { level: dto.level }),
        ...(dto.name && { name: dto.name }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async remove(id: string): Promise<GradeEntity> {
    return this.softDelete(id);
  }

  async softDelete(id: string): Promise<GradeEntity> {
    return this.prisma.grade.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
