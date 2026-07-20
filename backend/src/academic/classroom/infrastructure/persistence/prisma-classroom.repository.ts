import { Injectable } from '@nestjs/common';
import { Classroom, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { resolveAcademicYearId } from '../../../../shared/utils/active-academic-year.helper.js';
import {
  IClassroomRepository,
  CLASS_INCLUDE,
  ClassroomWithDetails,
  CreateClassroomRepositoryInput,
} from '../../domain/interfaces/classroom-repository.interface.js';
import { ClassroomQueryDto } from '../../dto/classroom-query.dto.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

@Injectable()
export class PrismaClassroomRepository extends IClassroomRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(
    query: ClassroomQueryDto,
  ): Promise<PaginatedResult<ClassroomWithDetails>> {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const { curriculumId, academicYearId, gradeId, search, isActive } = query;
    const skip = (page - 1) * limit;

    const resolvedAcademicYearId = academicYearId
      ? await resolveAcademicYearId(this.prisma, academicYearId)
      : undefined;

    const where: Prisma.ClassroomWhereInput = {
      deletedAt: null,
      ...(curriculumId && { curriculumId }),
      ...(resolvedAcademicYearId && { academicYearId: resolvedAcademicYearId }),
      ...(gradeId && { gradeId }),
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { code: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
        ],
      }),
      curricula: { deletedAt: null },
    };

    const [data, total] = await Promise.all([
      this.prisma.classroom.findMany({
        where,
        include: CLASS_INCLUDE,
        skip,
        take: limit,
        orderBy: [{ grade: { level: 'asc' } }, { code: 'asc' }],
      }),
      this.prisma.classroom.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<ClassroomWithDetails | null> {
    return this.prisma.classroom.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: CLASS_INCLUDE,
    });
  }

  async findDuplicate(
    academicYearId: string,
    gradeId: string,
    code: string,
    excludeId?: string,
  ): Promise<Classroom | null> {
    return this.prisma.classroom.findFirst({
      where: {
        academicYearId,
        gradeId,
        code,
        deletedAt: null,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
  }

  async create(
    data: CreateClassroomRepositoryInput,
  ): Promise<ClassroomWithDetails> {
    return this.prisma.classroom.create({ data, include: CLASS_INCLUDE });
  }

  async update(
    id: string,
    data: Prisma.ClassroomUpdateInput,
  ): Promise<ClassroomWithDetails> {
    return this.prisma.classroom.update({
      where: { id },
      data,
      include: CLASS_INCLUDE,
    });
  }

  async findByCode(code: string): Promise<ClassroomWithDetails | null> {
    return this.prisma.classroom.findFirst({
      where: {
        code: { equals: code, mode: 'insensitive' },
        deletedAt: null,
        isActive: true,
      },
      include: CLASS_INCLUDE,
    });
  }

  async findByAcademicYear(
    academicYearId: string,
  ): Promise<ClassroomWithDetails[]> {
    return this.prisma.classroom.findMany({
      where: {
        academicYearId,
        deletedAt: null,
      },
      include: CLASS_INCLUDE,
      orderBy: [{ grade: { level: 'asc' } }, { code: 'asc' }],
    });
  }

  async softDelete(id: string): Promise<Classroom> {
    return this.prisma.classroom.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
