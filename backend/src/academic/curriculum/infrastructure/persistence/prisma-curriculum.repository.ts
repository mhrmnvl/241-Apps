import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { resolveAcademicYearId } from '../../../../shared/utils/active-academic-year.helper.js';
import type {
  CurriculumQueryInput,
  CreateCurriculumRepositoryInput,
  UpdateCurriculumRepositoryInput,
} from '../../domain/interfaces/curriculum-repository.interface.js';
import { ICurriculumRepository } from '../../domain/interfaces/curriculum-repository.interface.js';
import { CURRICULUM_WITH_DETAILS_INCLUDE } from './prisma-curriculum.includes.js';

@Injectable()
export class PrismaCurriculumRepository extends ICurriculumRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(query: CurriculumQueryInput) {
    const { page = 1, limit = 10, search, academicYearId, isActive } = query;
    const skip = (page - 1) * limit;

    const resolvedAcademicYearId = academicYearId
      ? await resolveAcademicYearId(this.prisma, academicYearId)
      : undefined;

    const where: Prisma.CurriculaWhereInput = {
      deletedAt: null,
      ...(resolvedAcademicYearId && { academicYearId: resolvedAcademicYearId }),
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        name: { contains: search, mode: 'insensitive' },
      }),
      academicYear: { deletedAt: null },
    };

    const [data, total] = await Promise.all([
      this.prisma.curricula.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ academicYear: { name: 'desc' } }, { name: 'asc' }],
        include: CURRICULUM_WITH_DETAILS_INCLUDE,
      }),
      this.prisma.curricula.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string) {
    return this.prisma.curricula.findFirst({
      where: { id, deletedAt: null },
      include: CURRICULUM_WITH_DETAILS_INCLUDE,
    });
  }

  async findByName(name: string, excludeId?: string) {
    return this.prisma.curricula.findFirst({
      where: {
        deletedAt: null,
        name: { equals: name, mode: 'insensitive' },
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
  }

  async findByNameAndAcademicYear(
    name: string,
    academicYearId: string,
    excludeId?: string,
  ) {
    return this.prisma.curricula.findFirst({
      where: {
        academicYearId,
        deletedAt: null,
        name: { equals: name, mode: 'insensitive' },
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
  }

  async create(data: CreateCurriculumRepositoryInput) {
    return this.prisma.curricula.create({
      data,
      include: CURRICULUM_WITH_DETAILS_INCLUDE,
    });
  }

  async update(id: string, data: UpdateCurriculumRepositoryInput) {
    return this.prisma.curricula.update({
      where: { id },
      data,
      include: CURRICULUM_WITH_DETAILS_INCLUDE,
    });
  }

  async remove(id: string) {
    return this.softDelete(id);
  }

  async softDelete(id: string) {
    return this.prisma.curricula.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async countGradeAssignments(id: string): Promise<number> {
    return this.prisma.gradeAcademicYear.count({
      where: { curriculumId: id },
    });
  }
}
