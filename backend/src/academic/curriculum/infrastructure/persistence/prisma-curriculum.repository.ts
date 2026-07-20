import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { CurriculaQueryDto } from '../../dto/curriculum-query.dto.js';
import { resolveAcademicYearId } from '../../../../shared/utils/active-academic-year.helper.js';
import {
  ICurriculumRepository,
  CURRICULUM_INCLUDE,
} from '../../domain/interfaces/curriculum-repository.interface.js';

@Injectable()
export class PrismaCurriculumRepository extends ICurriculumRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(query: CurriculaQueryDto) {
    const { page = 1, limit = 10, search, academicYearId, isActive } = query;
    const skip = (page - 1) * limit;

    const resolvedAcademicYearId = academicYearId
      ? await resolveAcademicYearId(this.prisma, academicYearId)
      : undefined;

    const where: Prisma.CurriculaWhereInput = {
      deletedAt: null,
      ...(resolvedAcademicYearId && { academicYearId: resolvedAcademicYearId }),
      ...(isActive !== undefined && { isActive }),
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
      academicYear: { deletedAt: null },
    };

    const [data, total] = await Promise.all([
      this.prisma.curricula.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ academicYear: { name: 'desc' } }, { name: 'asc' }],
        include: CURRICULUM_INCLUDE,
      }),
      this.prisma.curricula.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string) {
    return this.prisma.curricula.findFirst({
      where: { id, deletedAt: null },
      include: CURRICULUM_INCLUDE,
    });
  }

  async findByNameAndAcademicYear(
    name: string,
    academicYearId: string,
    excludeId?: string,
  ) {
    return this.prisma.curricula.findFirst({
      where: {
        name,
        academicYearId,
        deletedAt: null,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
  }

  async create(data: {
    academicYearId: string;
    name: string;
    isActive?: boolean;
  }) {
    return this.prisma.curricula.create({
      data: {
        academicYearId: data.academicYearId,
        name: data.name,
        isActive: data.isActive,
      },
    });
  }

  async update(id: string, data: Prisma.CurriculaUpdateInput) {
    return this.prisma.curricula.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    return this.prisma.curricula.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
