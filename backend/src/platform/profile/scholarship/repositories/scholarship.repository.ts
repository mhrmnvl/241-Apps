import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { CreateScholarshipDto } from '../dto/create-scholarship.dto.js';
import { ScholarshipQueryDto } from '../dto/scholarship-query.dto.js';
import { UpdateScholarshipDto } from '../dto/update-scholarship.dto.js';

export const SCHOLARSHIP_INCLUDE = {
  profile: {
    select: { id: true, name: true, userId: true },
  },
} satisfies Prisma.ScholarshipInclude;

@Injectable()
export class ScholarshipRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ScholarshipQueryDto) {
    const { page = 1, limit = 20, profileId, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ScholarshipWhereInput = {
      deletedAt: null,
      ...(profileId && { profileId }),
      ...(status && { status }),
    };

    const [data, total] = await Promise.all([
      this.prisma.scholarship.findMany({
        where,
        include: SCHOLARSHIP_INCLUDE,
        skip,
        take: limit,
        orderBy: [{ year: 'desc' }],
      }),
      this.prisma.scholarship.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string) {
    return this.prisma.scholarship.findFirst({
      where: { id, deletedAt: null },
      include: SCHOLARSHIP_INCLUDE,
    });
  }

  async create(dto: CreateScholarshipDto) {
    return this.prisma.scholarship.create({
      data: dto,
      include: SCHOLARSHIP_INCLUDE,
    });
  }

  async update(id: string, dto: UpdateScholarshipDto) {
    return this.prisma.scholarship.update({
      where: { id },
      data: dto,
      include: SCHOLARSHIP_INCLUDE,
    });
  }

  async softDelete(id: string) {
    return this.prisma.scholarship.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
