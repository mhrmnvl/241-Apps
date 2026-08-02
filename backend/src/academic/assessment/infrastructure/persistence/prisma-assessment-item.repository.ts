import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import type {
  AssessmentItemQueryInput,
  CreateAssessmentItemRepositoryInput,
  UpdateAssessmentItemRepositoryInput,
} from '../../domain/interfaces/assessment-item-repository.interface.js';
import { IAssessmentItemRepository } from '../../domain/interfaces/assessment-item-repository.interface.js';
import { ASSESSMENT_ITEM_WITH_DETAILS_INCLUDE } from './prisma-assessment.includes.js';

@Injectable()
export class PrismaAssessmentItemRepository extends IAssessmentItemRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(query: AssessmentItemQueryInput) {
    const { page = 1, limit = 10, teachingAssignmentId, type } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.AssessmentItemWhereInput = {
      deletedAt: null,
      ...(teachingAssignmentId && { teachingAssignmentId }),
      ...(type && { type }),
    };

    const [data, total] = await Promise.all([
      this.prisma.assessmentItem.findMany({
        where,
        include: ASSESSMENT_ITEM_WITH_DETAILS_INCLUDE,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.assessmentItem.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string) {
    return this.prisma.assessmentItem.findFirst({
      where: { id, deletedAt: null },
      include: ASSESSMENT_ITEM_WITH_DETAILS_INCLUDE,
    });
  }

  async create(dto: CreateAssessmentItemRepositoryInput) {
    return this.prisma.assessmentItem.create({
      data: {
        teachingAssignmentId: dto.teachingAssignmentId,
        name: dto.name,
        type: dto.type,
        ...(dto.weight !== undefined && { weight: dto.weight }),
        ...(dto.maxScore !== undefined && { maxScore: dto.maxScore }),
      },
      include: ASSESSMENT_ITEM_WITH_DETAILS_INCLUDE,
    });
  }

  async update(id: string, dto: UpdateAssessmentItemRepositoryInput) {
    return this.prisma.assessmentItem.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.type && { type: dto.type }),
        ...(dto.weight !== undefined && { weight: dto.weight }),
        ...(dto.maxScore !== undefined && { maxScore: dto.maxScore }),
      },
      include: ASSESSMENT_ITEM_WITH_DETAILS_INCLUDE,
    });
  }

  async remove(id: string) {
    return this.softDelete(id);
  }

  async softDelete(id: string) {
    return this.prisma.assessmentItem.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async countScoresWithAssessmentItem(id: string): Promise<number> {
    return this.prisma.studentScore.count({
      where: { assessmentItemId: id, deletedAt: null },
    });
  }
}
