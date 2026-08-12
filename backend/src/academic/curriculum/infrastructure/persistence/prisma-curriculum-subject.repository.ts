import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import type {
  CurriculumSubjectQueryInput,
  CreateCurriculumSubjectRepositoryInput,
  PassingScoreQuery,
  ResolvedPassingScore,
  UpdateCurriculumSubjectRepositoryInput,
} from '../../domain/interfaces/curriculum-subject-repository.interface.js';
import { ICurriculumSubjectRepository } from '../../domain/interfaces/curriculum-subject-repository.interface.js';
import { CURRICULUM_SUBJECT_WITH_DETAILS_INCLUDE } from './prisma-curriculum.includes.js';

@Injectable()
export class PrismaCurriculumSubjectRepository extends ICurriculumSubjectRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(query: CurriculumSubjectQueryInput) {
    const { page = 1, limit = 10, curriculumId, subjectId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CurriculumSubjectWhereInput = {
      deletedAt: null,
      ...(curriculumId && { curriculumId }),
      ...(subjectId && { subjectId }),
    };

    const [data, total] = await Promise.all([
      this.prisma.curriculumSubject.findMany({
        where,
        include: CURRICULUM_SUBJECT_WITH_DETAILS_INCLUDE,
        skip,
        take: limit,
        orderBy: [{ subject: { name: 'asc' } }],
      }),
      this.prisma.curriculumSubject.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string) {
    return this.prisma.curriculumSubject.findFirst({
      where: { id, deletedAt: null },
      include: CURRICULUM_SUBJECT_WITH_DETAILS_INCLUDE,
    });
  }

  async findAssignment(
    curriculaId: string,
    subjectId: string,
    gradeId?: string,
    excludeId?: string,
  ) {
    return this.findDuplicate(curriculaId, subjectId, gradeId, excludeId);
  }

  async findPassingScores(
    queries: PassingScoreQuery[],
  ): Promise<ResolvedPassingScore[]> {
    if (queries.length === 0) return [];

    // Two round trips rather than one deep include: resolving through the
    // relation would fetch every subject of every curriculum touched, once per
    // score row. These two are bounded by the distinct grades and subjects a
    // single report card actually spans.
    const gradeAcademicYears = await this.prisma.gradeAcademicYear.findMany({
      where: {
        OR: queries.map((query) => ({
          gradeId: query.gradeId,
          academicYearId: query.academicYearId,
        })),
      },
      select: { gradeId: true, academicYearId: true, curriculumId: true },
    });

    if (gradeAcademicYears.length === 0) return [];

    const curriculumSubjects = await this.prisma.curriculumSubject.findMany({
      where: {
        curriculumId: {
          in: [...new Set(gradeAcademicYears.map((row) => row.curriculumId))],
        },
        subjectId: {
          in: [...new Set(queries.map((query) => query.subjectId))],
        },
        deletedAt: null,
      },
      select: { curriculumId: true, subjectId: true, passingScore: true },
    });

    const byCurriculumSubject = new Map(
      curriculumSubjects.map((row) => [
        `${row.curriculumId}:${row.subjectId}`,
        row.passingScore,
      ]),
    );
    const curriculumByGradeYear = new Map(
      gradeAcademicYears.map((row) => [
        `${row.gradeId}:${row.academicYearId}`,
        row.curriculumId,
      ]),
    );

    const resolved: ResolvedPassingScore[] = [];
    for (const query of queries) {
      const curriculumId = curriculumByGradeYear.get(
        `${query.gradeId}:${query.academicYearId}`,
      );
      if (!curriculumId) continue;

      const passingScore = byCurriculumSubject.get(
        `${curriculumId}:${query.subjectId}`,
      );
      if (passingScore === undefined) continue;

      resolved.push({ ...query, passingScore });
    }

    return resolved;
  }

  async findDuplicate(
    curriculumId: string,
    subjectId: string,
    gradeId?: string,
    excludeId?: string,
  ) {
    return this.prisma.curriculumSubject.findFirst({
      where: {
        curriculumId,
        subjectId,
        deletedAt: null,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
  }

  async create(data: CreateCurriculumSubjectRepositoryInput) {
    return this.prisma.curriculumSubject.create({
      data,
      include: CURRICULUM_SUBJECT_WITH_DETAILS_INCLUDE,
    });
  }

  async update(id: string, data: UpdateCurriculumSubjectRepositoryInput) {
    return this.prisma.curriculumSubject.update({
      where: { id },
      data,
      include: CURRICULUM_SUBJECT_WITH_DETAILS_INCLUDE,
    });
  }

  async findSoftDeleted(curriculumId: string, subjectId: string) {
    return this.prisma.curriculumSubject.findFirst({
      where: {
        curriculumId,
        subjectId,
        deletedAt: { not: null },
      },
    });
  }

  async restore(id: string, data?: UpdateCurriculumSubjectRepositoryInput) {
    return this.prisma.curriculumSubject.update({
      where: { id },
      data: { ...(data ?? {}), deletedAt: null },
      include: CURRICULUM_SUBJECT_WITH_DETAILS_INCLUDE,
    });
  }

  async remove(id: string) {
    return this.softDelete(id);
  }

  async softDelete(id: string) {
    return this.prisma.curriculumSubject.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
