import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import {
  IGradeAcademicYearRepository,
  GRADE_AY_INCLUDE,
  GradeAcademicYearWithDetails,
} from '../../domain/interfaces/grade-academic-year-repository.interface.js';

@Injectable()
export class PrismaGradeAcademicYearRepository extends IGradeAcademicYearRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(
    academicYearId?: string,
  ): Promise<GradeAcademicYearWithDetails[]> {
    const where: Prisma.GradeAcademicYearWhereInput = academicYearId
      ? { academicYearId }
      : {};
    return this.prisma.gradeAcademicYear.findMany({
      where,
      include: GRADE_AY_INCLUDE,
      orderBy: { grade: { level: 'asc' } },
    });
  }

  async findByGradeAndYear(gradeId: string, academicYearId: string) {
    return this.prisma.gradeAcademicYear.findUnique({
      where: { gradeId_academicYearId: { gradeId, academicYearId } },
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
      include: GRADE_AY_INCLUDE,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.gradeAcademicYear.delete({ where: { id } });
  }
}
