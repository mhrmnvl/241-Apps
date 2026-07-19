import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { CreateEducationalHistoryDto } from '../dto/create-educational-history.dto.js';
import { EducationalHistoryQueryDto } from '../dto/educational-history-query.dto.js';
import { UpdateEducationalHistoryDto } from '../dto/update-educational-history.dto.js';

export const EDUCATIONAL_HISTORY_INCLUDE = {
  profile: {
    select: { id: true, name: true, userId: true },
  },
} satisfies Prisma.EducationalHistoryInclude;

@Injectable()
export class EducationalHistoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: EducationalHistoryQueryDto) {
    const { page = 1, limit = 50, profileId, level, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.EducationalHistoryWhereInput = {
      deletedAt: null,
      ...(profileId && { profileId }),
      ...(level && { level }),
      ...(status && { status }),
    };

    const [data, total] = await Promise.all([
      this.prisma.educationalHistory.findMany({
        where,
        include: EDUCATIONAL_HISTORY_INCLUDE,
        skip,
        take: limit,
        orderBy: [{ startYear: 'desc' }],
      }),
      this.prisma.educationalHistory.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string) {
    return this.prisma.educationalHistory.findFirst({
      where: { id, deletedAt: null },
      include: EDUCATIONAL_HISTORY_INCLUDE,
    });
  }

  async create(dto: CreateEducationalHistoryDto) {
    return this.prisma.educationalHistory.create({
      data: dto,
      include: EDUCATIONAL_HISTORY_INCLUDE,
    });
  }

  async update(id: string, dto: UpdateEducationalHistoryDto) {
    return this.prisma.educationalHistory.update({
      where: { id },
      data: dto,
      include: EDUCATIONAL_HISTORY_INCLUDE,
    });
  }

  async softDelete(id: string) {
    return this.prisma.educationalHistory.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
