import { Injectable } from '@nestjs/common';
import { AssessmentType, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { AssessmentItemQueryDto } from '../../dto/request/assessment-item-query.dto.js';
import {
  IAssessmentItemsRepository,
  ASSESSMENT_ITEM_INCLUDE,
} from '../../domain/interfaces/assessment-items-repository.interface.js';

@Injectable()
export class PrismaAssessmentItemsRepository extends IAssessmentItemsRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(query: AssessmentItemQueryDto) {
    const { page = 1, limit = 10, teachingAssignmentId, type } = query;
    const skip = (page - 1) * limit;
    const where: Prisma.AssessmentItemWhereInput = {
      deletedAt: null,
      ...(teachingAssignmentId && { teachingAssignmentId }),
      ...(type && { type: type }),
    };
    const [data, total] = await Promise.all([
      this.prisma.assessmentItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: ASSESSMENT_ITEM_INCLUDE,
      }),
      this.prisma.assessmentItem.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findById(id: string) {
    return this.prisma.assessmentItem.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: ASSESSMENT_ITEM_INCLUDE,
    });
  }

  async create(data: {
    teachingAssignmentId: string;
    name: string;
    type: AssessmentType;
    weight?: number;
    maxScore?: number;
  }) {
    return this.prisma.assessmentItem.create({
      data: {
        teachingAssignmentId: data.teachingAssignmentId,
        name: data.name,
        type: data.type,
        weight: data.weight,
        maxScore: data.maxScore,
      },
    });
  }

  async update(id: string, data: Prisma.AssessmentItemUpdateInput) {
    return this.prisma.assessmentItem.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    return this.prisma.assessmentItem.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
