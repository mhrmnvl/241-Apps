import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { ClassroomLevelQueryDto } from '../../dto/grade-query.dto.js';
import { CreateGradeDto } from '../../dto/create-grade.dto.js';
import { UpdateGradeDto } from '../../dto/update-grade.dto.js';
import { IClassroomLevelsRepository } from '../../domain/interfaces/classroom-levels-repository.interface.js';

@Injectable()
export class PrismaClassroomLevelsRepository extends IClassroomLevelsRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(query: ClassroomLevelQueryDto) {
    const { page = 1, limit = 10, search, isActive } = query;
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

  async findById(id: string) {
    return this.prisma.grade.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByLevel(level: number) {
    return this.prisma.grade.findFirst({
      where: { level, deletedAt: null },
    });
  }

  async findByName(name: string) {
    return this.prisma.grade.findFirst({
      where: { name, deletedAt: null },
    });
  }

  async create(dto: CreateGradeDto) {
    return this.prisma.grade.create({
      data: {
        level: dto.level,
        name: dto.name,
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async update(id: string, dto: UpdateGradeDto) {
    return this.prisma.grade.update({
      where: { id },
      data: {
        ...(dto.level !== undefined && { level: dto.level }),
        ...(dto.name && { name: dto.name }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async softDelete(id: string) {
    return this.prisma.grade.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
