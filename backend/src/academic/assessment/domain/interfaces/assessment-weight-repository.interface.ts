import { AssessmentType } from '@prisma/client';

export interface AssessmentWeightEntity {
  type: AssessmentType;
  weight: number;
}

export interface ReplaceAssessmentWeightsInput {
  teachingAssignmentId: string;
  weights: AssessmentWeightEntity[];
}

export abstract class IAssessmentWeightRepository {
  abstract findByTeachingAssignment(
    teachingAssignmentId: string,
  ): Promise<AssessmentWeightEntity[]>;

  /**
   * Replaces the whole set for one assignment.
   *
   * Never a partial update: the rows only mean anything as a set that totals
   * 100, so writing one at a time would leave the assignment briefly grading
   * against something nobody chose.
   */
  abstract replaceForTeachingAssignment(
    input: ReplaceAssessmentWeightsInput,
  ): Promise<AssessmentWeightEntity[]>;
}
