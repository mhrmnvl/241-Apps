import { Injectable } from '@nestjs/common';
import { Prisma, SemesterType } from '@prisma/client';
import { PrismaService } from '../../../../../core/database/prisma.service.js';
import { ISemesterTypeRepository } from '../../domain/interfaces/semester-type-repository.interface.js';
import { SemesterTypeQueryDto } from '../../dto/request/semester-type-query.dto.js';

@Injectable()
export class PrismaSemesterTypeRepository extends ISemesterTypeRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(query: SemesterTypeQueryDto): Promise<{
    data: SemesterType[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10, search, isActive } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.SemesterTypeWhereInput = {
      deletedAt: null,
      ...(isActive !== undefined && { isActive }),
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
    };

    const [data, total] = await Promise.all([
      this.prisma.semesterType.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.semesterType.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<SemesterType | null> {
    return this.prisma.semesterType.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByName(name: string): Promise<SemesterType | null> {
    return this.prisma.semesterType.findFirst({
      where: { name, deletedAt: null },
    });
  }

  async create(data: {
    name: string;
    isActive: boolean;
  }): Promise<SemesterType> {
    return this.prisma.semesterType.create({ data });
  }

  async update(
    id: string,
    data: Prisma.SemesterTypeUpdateInput,
  ): Promise<SemesterType> {
    return this.prisma.semesterType.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<SemesterType> {
    return this.prisma.semesterType.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async hasRelatedData(id: string): Promise<boolean> {
    const count = await this.prisma.semester.count({
      where: { typeId: id, deletedAt: null },
      take: 1,
    });
    return count > 0;
  }
}
