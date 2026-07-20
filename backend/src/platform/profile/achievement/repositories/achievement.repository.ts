import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { AchievementQueryDto } from '../dto/request/achievement-query.dto.js';
import { CreateAchievementDto } from '../dto/request/create-achievement.dto.js';
import { UpdateAchievementDto } from '../dto/request/update-achievement.dto.js';

export const ACHIEVEMENT_INCLUDE = {
  profile: {
    select: { id: true, name: true, userId: true },
  },
  type: true,
} satisfies Prisma.AchievementInclude;

@Injectable()
export class AchievementRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: AchievementQueryDto) {
    const { page = 1, limit = 20, profileId, typeId, year } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.AchievementWhereInput = {
      deletedAt: null,
      ...(profileId && { profileId }),
      ...(typeId && { typeId }),
      ...(year && { year }),
    };

    const [data, total] = await Promise.all([
      this.prisma.achievement.findMany({
        where,
        include: ACHIEVEMENT_INCLUDE,
        skip,
        take: limit,
        orderBy: [{ year: 'desc' }, { name: 'asc' }],
      }),
      this.prisma.achievement.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string) {
    return this.prisma.achievement.findFirst({
      where: { id, deletedAt: null },
      include: ACHIEVEMENT_INCLUDE,
    });
  }

  async create(dto: CreateAchievementDto) {
    return this.prisma.achievement.create({
      data: dto,
      include: ACHIEVEMENT_INCLUDE,
    });
  }

  async update(id: string, dto: UpdateAchievementDto) {
    return this.prisma.achievement.update({
      where: { id },
      data: dto,
      include: ACHIEVEMENT_INCLUDE,
    });
  }

  async softDelete(id: string) {
    return this.prisma.achievement.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
