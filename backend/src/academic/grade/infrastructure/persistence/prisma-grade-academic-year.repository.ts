import type {
  CreateGradeAcademicYearRepositoryInput,
  UpdateGradeAcademicYearRepositoryInput,
} from '../../domain/interfaces/grade-academic-year-repository.interface.js';
import { Injectable } from '@nestjs/common';
import { GradeAcademicYear, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { IGradeAcademicYearRepository } from '../../domain/interfaces/grade-academic-year-repository.interface.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';
import {
  GRADE_AY_WITH_DETAILS_INCLUDE,
  GradeAcademicYearWithDetails,
} from './prisma-grade-academic-year.includes.js';

@Injectable()
export class PrismaGradeAcademicYearRepository extends IGradeAcademicYearRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(
    academicYearId?: string,
  ): Promise<PaginatedResult<GradeAcademicYearWithDetails>> {
    const where: Prisma.GradeAcademicYearWhereInput = academicYearId
      ? { academicYearId }
      : {};
    const data = await this.prisma.gradeAcademicYear.findMany({
      where,
      include: GRADE_AY_WITH_DETAILS_INCLUDE,
      orderBy: { grade: { level: 'asc' } },
    });
    return { data, total: data.length, page: 1, limit: data.length || 10 };
  }

  async findById(id: string): Promise<GradeAcademicYearWithDetails | null> {
    return this.prisma.gradeAcademicYear.findFirst({
      where: { id },
      include: GRADE_AY_WITH_DETAILS_INCLUDE,
    });
  }

  async findAssignment(
    gradeId: string,
    academicYearId: string,
  ): Promise<GradeAcademicYear | null> {
    return this.findByGradeAndYear(gradeId, academicYearId);
  }

  async findByGradeAndYear(
    gradeId: string,
    academicYearId: string,
  ): Promise<GradeAcademicYear | null> {
    return this.prisma.gradeAcademicYear.findUnique({
      where: { gradeId_academicYearId: { gradeId, academicYearId } },
    });
  }

  async create(
    dto: CreateGradeAcademicYearRepositoryInput,
  ): Promise<GradeAcademicYearWithDetails> {
    return this.prisma.gradeAcademicYear.create({
      data: dto,
      include: GRADE_AY_WITH_DETAILS_INCLUDE,
    });
  }

  async update(
    id: string,
    dto: UpdateGradeAcademicYearRepositoryInput,
  ): Promise<GradeAcademicYearWithDetails> {
    return this.prisma.gradeAcademicYear.update({
      where: { id },
      data: dto,
      include: GRADE_AY_WITH_DETAILS_INCLUDE,
    });
  }

  async upsert(data: {
    gradeId: string;
    academicYearId: string;
    curriculumId: string;
  }): Promise<GradeAcademicYearWithDetails> {
    return this.prisma.gradeAcademicYear.upsert({
      where: {
        gradeId_academicYearId: {
          gradeId: data.gradeId,
          academicYearId: data.academicYearId,
        },
      },
      create: data,
      update: { curriculumId: data.curriculumId },
      include: GRADE_AY_WITH_DETAILS_INCLUDE,
    });
  }

  async remove(id: string): Promise<GradeAcademicYear> {
    return this.prisma.gradeAcademicYear.delete({ where: { id } });
  }

  async delete(id: string): Promise<GradeAcademicYear> {
    return this.remove(id);
  }
}
