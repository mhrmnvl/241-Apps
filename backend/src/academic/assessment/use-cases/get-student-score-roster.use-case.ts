import { Injectable, NotFoundException } from '@nestjs/common';
import { IAssessmentItemRepository } from '../domain/interfaces/assessment-items-repository.interface.js';
import { IStudentScoreRepository } from '../domain/interfaces/student-scores-repository.interface.js';
import { StudentScoreRosterQueryDto } from '../dto/request/student-score-roster-query.dto.js';

@Injectable()
export class GetStudentScoreRosterUseCase {
  constructor(
    private readonly studentScoreRepository: IStudentScoreRepository,
    private readonly assessmentItemRepository: IAssessmentItemRepository,
  ) {}
  async execute(query: StudentScoreRosterQueryDto) {
    const assessmentItem = await this.assessmentItemRepository.findById(
      query.assessmentItemId,
    );
    if (!assessmentItem) {
      throw new NotFoundException(
        `AssessmentItem ${query.assessmentItemId} not found`,
      );
    }

    const items = await this.studentScoreRepository.getRoster(
      assessmentItem.id,
      assessmentItem.teachingAssignment.classroomId,
      assessmentItem.teachingAssignment.semesterId,
    );

    return {
      assessmentItem: {
        id: assessmentItem.id,
        name: assessmentItem.name,
        type: assessmentItem.type,
        weight: assessmentItem.weight,
        maxScore: assessmentItem.maxScore,
      },
      items,
    };
  }
}
