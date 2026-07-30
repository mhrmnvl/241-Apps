import { Injectable, NotFoundException } from '@nestjs/common';
import { IAssessmentItemsRepository } from '../domain/interfaces/assessment-items-repository.interface.js';
import { IStudentScoresRepository } from '../domain/interfaces/student-scores-repository.interface.js';
import { StudentScoreRosterQueryDto } from '../dto/request/student-score-roster-query.dto.js';

@Injectable()
export class GetStudentScoreRosterUseCase {
  constructor(
    private readonly studentScoreRepository: IStudentScoresRepository,
    private readonly assessmentItemRepository: IAssessmentItemsRepository,
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
