import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/database/prisma.service.js';
import {
  CreateEducationalHistoryRepositoryInput,
  EducationalHistoryQueryInput,
  UpdateEducationalHistoryRepositoryInput,
} from '../../domain/interfaces/educational-history-repository.interface.js';
import { IEducationalHistoryRepository } from '../../domain/interfaces/educational-history-repository.interface.js';

export const EDUCATIONAL_HISTORY_INCLUDE = {
  profile: {
    select: { id: true, name: true, userId: true },
  },
} satisfies Prisma.EducationalHistoryInclude;

@Injectable()
export class PrismaEducationalHistoryRepository implements IEducationalHistoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: EducationalHistoryQueryInput) {
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

  async create(dto: CreateEducationalHistoryRepositoryInput) {
    return this.prisma.educationalHistory.create({
      data: dto,
      include: EDUCATIONAL_HISTORY_INCLUDE,
    });
  }

  async update(id: string, dto: UpdateEducationalHistoryRepositoryInput) {
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
