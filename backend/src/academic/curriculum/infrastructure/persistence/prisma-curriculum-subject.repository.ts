import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { CurriculumSubjectQueryDto } from '../../dto/request/curriculum-subject-query.dto.js';
import {
  ICurriculumSubjectRepository,
  CURRICULUM_SUBJECT_INCLUDE,
} from '../../domain/interfaces/curriculum-subject-repository.interface.js';

@Injectable()
export class PrismaCurriculumSubjectRepository extends ICurriculumSubjectRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(query: CurriculumSubjectQueryDto) {
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
        include: CURRICULUM_SUBJECT_INCLUDE,
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
      include: CURRICULUM_SUBJECT_INCLUDE,
    });
  }

  async findDuplicate(
    curriculumId: string,
    subjectId: string,
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

  async create(data: {
    curriculumId: string;
    subjectId: string;
    hoursPerWeek?: number;
  }) {
    return this.prisma.curriculumSubject.create({
      data,
      include: CURRICULUM_SUBJECT_INCLUDE,
    });
  }

  async update(id: string, data: Prisma.CurriculumSubjectUpdateInput) {
    return this.prisma.curriculumSubject.update({
      where: { id },
      data,
      include: CURRICULUM_SUBJECT_INCLUDE,
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

  async restore(id: string, data: { hoursPerWeek?: number }) {
    return this.prisma.curriculumSubject.update({
      where: { id },
      data: { ...data, deletedAt: null },
      include: CURRICULUM_SUBJECT_INCLUDE,
    });
  }

  async softDelete(id: string) {
    return this.prisma.curriculumSubject.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
