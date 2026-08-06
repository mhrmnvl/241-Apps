import { Injectable } from '@nestjs/common';
import { Prisma, Semester, SemesterType } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { ISemesterRepository } from '../../domain/interfaces/semester-repository.interface.js';
import type {
  SemesterQueryInput,
  CreateSemesterRepositoryInput,
  UpdateSemesterRepositoryInput,
} from '../../domain/interfaces/semester-repository.interface.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';
import {
  SEMESTER_WITH_DETAILS_INCLUDE,
  SemesterWithDetails,
} from './prisma-semester.includes.js';

@Injectable()
export class PrismaSemesterRepository extends ISemesterRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(
    query: SemesterQueryInput,
  ): Promise<PaginatedResult<SemesterWithDetails>> {
    const { page = 1, limit = 10, search, academicYearId, isActive } = query;
    const skip = (page - 1) * limit;

    // No active-year fallback on purpose, unlike classroom and curriculum.
    // Promotion moves students into the NEXT academic year and picks its target
    // semester from this list, so defaulting to the active year would make that
    // target unreachable and break the year-end promotion flow.
    // Both conditions live under one `academicYear` key: spreading a second
    // one would replace the first, and the search branch used to drop the
    // soft-delete guard that way — searching surfaced semesters belonging to
    // deleted academic years.
    const where: Prisma.SemesterWhereInput = {
      deletedAt: null,
      academicYear: {
        deletedAt: null,
        ...(search && { name: { contains: search, mode: 'insensitive' } }),
      },
      ...(academicYearId && { academicYearId }),
      ...(isActive !== undefined && { isActive }),
    };

    const [data, total] = await Promise.all([
      this.prisma.semester.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { academicYear: { name: 'desc' } },
          { type: { name: 'asc' } },
        ],
        include: SEMESTER_WITH_DETAILS_INCLUDE,
      }),
      this.prisma.semester.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<SemesterWithDetails | null> {
    return this.prisma.semester.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: SEMESTER_WITH_DETAILS_INCLUDE,
    });
  }

  async findActive(): Promise<SemesterWithDetails | null> {
    return this.prisma.semester.findFirst({
      where: {
        isActive: true,
        deletedAt: null,
      },
      include: SEMESTER_WITH_DETAILS_INCLUDE,
    });
  }

  async findByAcademicYearAndType(
    academicYearId: string,
    typeId: string,
  ): Promise<Semester | null> {
    return this.prisma.semester.findFirst({
      where: { academicYearId, typeId, deletedAt: null },
    });
  }

  async create(
    data: CreateSemesterRepositoryInput,
  ): Promise<SemesterWithDetails> {
    return this.prisma.semester.create({
      data,
      include: SEMESTER_WITH_DETAILS_INCLUDE,
    });
  }

  async update(
    id: string,
    data: UpdateSemesterRepositoryInput,
  ): Promise<SemesterWithDetails> {
    return this.prisma.semester.update({
      where: { id },
      data,
      include: SEMESTER_WITH_DETAILS_INCLUDE,
    });
  }

  async deactivateAll(): Promise<Prisma.BatchPayload> {
    return this.prisma.semester.updateMany({
      where: {
        isActive: true,
      },
      data: { isActive: false },
    });
  }

  async deactivateAllActive(excludeId?: string): Promise<Prisma.BatchPayload> {
    return this.prisma.semester.updateMany({
      where: {
        isActive: true,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
      data: { isActive: false },
    });
  }

  async activateById(id: string): Promise<SemesterWithDetails> {
    return this.prisma.$transaction(async (tx) => {
      await tx.semester.updateMany({
        where: {
          isActive: true,
        },
        data: { isActive: false },
      });
      return tx.semester.update({
        where: { id },
        data: { isActive: true },
        include: SEMESTER_WITH_DETAILS_INCLUDE,
      });
    });
  }

  async findTypeById(id: string): Promise<SemesterType | null> {
    return this.prisma.semesterType.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async hasRelatedData(id: string): Promise<boolean> {
    const count = await this.prisma.studentEnrollment.count({
      where: { semesterId: id, deletedAt: null },
      take: 1,
    });
    return count > 0;
  }

  async remove(id: string): Promise<Semester> {
    return this.softDelete(id);
  }

  async softDelete(id: string): Promise<Semester> {
    return this.prisma.semester.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
