import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { EducationQueryDto } from '../dto/education-query.dto.js';
import { IEducationRepository } from '../interfaces/education-repository.interface.js';

@Injectable()
export class EducationRepository implements IEducationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: EducationQueryDto) {
    const { page = 1, limit = 10, search, isActive } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.EducationWhereInput = {
      deletedAt: null,
      ...(isActive !== undefined && { isActive }),
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
    };

    const [data, total] = await Promise.all([
      this.prisma.education.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.education.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string) {
    return this.prisma.education.findFirst({ where: { id, deletedAt: null } });
  }

  async findByName(name: string, excludeId?: string) {
    return this.prisma.education.findFirst({
      where: {
        name,
        deletedAt: null,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
  }

  async countParentUsage(id: string) {
    return this.prisma.parent.count({ where: { educationId: id } });
  }

  async create(data: { name: string; isActive?: boolean }) {
    return this.prisma.education.create({ data });
  }

  async update(id: string, data: Prisma.EducationUpdateInput) {
    return this.prisma.education.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    return this.prisma.education.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
