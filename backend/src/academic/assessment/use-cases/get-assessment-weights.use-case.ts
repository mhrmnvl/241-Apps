import { Injectable, NotFoundException } from '@nestjs/common';
import { AssessmentType } from '../../../shared/domain/enums/assessment-type.enum.js';
import { ITeachingAssignmentRepository } from '../../teaching-assignment/domain/interfaces/teaching-assignment-repository.interface.js';
import {
  AssessmentWeightEntity,
  IAssessmentWeightRepository,
} from '../domain/interfaces/assessment-weight-repository.interface.js';

@Injectable()
export class GetAssessmentWeightsUseCase {
  constructor(
    private readonly assessmentWeightRepository: IAssessmentWeightRepository,
    private readonly teachingAssignmentRepository: ITeachingAssignmentRepository,
  ) {}

  /**
   * Always answers with all five types, filling the unset ones with zero.
   *
   * The editor is a fixed set of rows that must total 100, so handing it a
   * sparse list would make the client invent the missing ones — and invent
   * them differently from the next client.
   */
  async execute(
    teachingAssignmentId: string,
  ): Promise<AssessmentWeightEntity[]> {
    const assignment =
      await this.teachingAssignmentRepository.findById(teachingAssignmentId);
    if (!assignment) {
      throw new NotFoundException(
        `Teaching assignment with ID ${teachingAssignmentId} not found`,
      );
    }

    const stored =
      await this.assessmentWeightRepository.findByTeachingAssignment(
        teachingAssignmentId,
      );
    const byType = new Map(stored.map((row) => [row.type, row.weight]));

    return Object.values(AssessmentType).map((type) => ({
      type,
      weight: byType.get(type) ?? 0,
    }));
  }
}
