import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../../shared/domain/interfaces/repository.interface.js';
import { AssessmentType } from '../../../../shared/domain/enums/assessment-type.enum.js';
import { AssessmentItemEntity } from '../entities/assessment-item.entity.js';
import { AssessmentItemWithDetails } from '../entities/assessment-item.entity.js';

export type { AssessmentItemWithDetails };

export interface AssessmentItemQueryInput extends PaginationQueryInput {
  type?: AssessmentType;
  teachingAssignmentId?: string;
  search?: string;
}

export interface CreateAssessmentItemRepositoryInput {
  teachingAssignmentId: string;
  name: string;
  type: AssessmentType;
  weight?: number;
  maxScore?: number;
}

export type UpdateAssessmentItemRepositoryInput =
  Partial<CreateAssessmentItemRepositoryInput>;

export abstract class IAssessmentItemRepository {
  abstract findAll(
    query: AssessmentItemQueryInput,
  ): Promise<PaginatedResult<AssessmentItemWithDetails>>;
  abstract findById(id: string): Promise<AssessmentItemWithDetails | null>;
  abstract create(
    input: CreateAssessmentItemRepositoryInput,
  ): Promise<AssessmentItemWithDetails>;
  abstract update(
    id: string,
    input: UpdateAssessmentItemRepositoryInput,
  ): Promise<AssessmentItemWithDetails>;
  abstract remove(id: string): Promise<AssessmentItemEntity>;
  abstract softDelete(id: string): Promise<AssessmentItemEntity>;
  abstract countScoresWithAssessmentItem(id: string): Promise<number>;
}
