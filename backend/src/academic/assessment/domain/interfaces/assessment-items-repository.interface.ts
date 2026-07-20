import { AssessmentItem, AssessmentType, Prisma } from '@prisma/client';
import type { AssessmentItemQueryDto } from '../../dto/request/assessment-item-query.dto.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

export const ASSESSMENT_ITEM_INCLUDE = {
  teachingAssignment: { include: { subject: true, classroom: true } },
} satisfies Prisma.AssessmentItemInclude;

export type AssessmentItemWithDetails = Prisma.AssessmentItemGetPayload<{
  include: typeof ASSESSMENT_ITEM_INCLUDE;
}>;

export abstract class IAssessmentItemsRepository {
  abstract findAll(
    query: AssessmentItemQueryDto,
  ): Promise<PaginatedResult<AssessmentItemWithDetails>>;

  abstract findById(id: string): Promise<AssessmentItemWithDetails | null>;

  abstract create(data: {
    teachingAssignmentId: string;
    name: string;
    type: AssessmentType;
    weight?: number;
    maxScore?: number;
  }): Promise<AssessmentItem>;

  abstract update(
    id: string,
    data: Prisma.AssessmentItemUpdateInput,
  ): Promise<AssessmentItem>;

  abstract softDelete(id: string): Promise<AssessmentItem>;
}
