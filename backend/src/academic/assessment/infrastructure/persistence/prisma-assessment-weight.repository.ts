import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import {
  AssessmentWeightEntity,
  IAssessmentWeightRepository,
  ReplaceAssessmentWeightsInput,
} from '../../domain/interfaces/assessment-weight-repository.interface.js';

@Injectable()
export class PrismaAssessmentWeightRepository extends IAssessmentWeightRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findByTeachingAssignment(
    teachingAssignmentId: string,
  ): Promise<AssessmentWeightEntity[]> {
    return this.prisma.assessmentWeight.findMany({
      where: { teachingAssignmentId },
      select: { type: true, weight: true },
      orderBy: { type: 'asc' },
    });
  }

  async replaceForTeachingAssignment(
    input: ReplaceAssessmentWeightsInput,
  ): Promise<AssessmentWeightEntity[]> {
    const { teachingAssignmentId, weights } = input;

    return this.prisma.$transaction(async (tx) => {
      await tx.assessmentWeight.deleteMany({ where: { teachingAssignmentId } });

      if (weights.length > 0) {
        await tx.assessmentWeight.createMany({
          data: weights.map((weight) => ({
            teachingAssignmentId,
            type: weight.type,
            weight: weight.weight,
          })),
        });
      }

      return tx.assessmentWeight.findMany({
        where: { teachingAssignmentId },
        select: { type: true, weight: true },
        orderBy: { type: 'asc' },
      });
    });
  }
}
