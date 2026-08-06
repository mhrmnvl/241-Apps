import { Injectable } from '@nestjs/common';
import { IAssessmentItemRepository } from '../domain/interfaces/assessment-item-repository.interface.js';
import { AssessmentItemQueryDto } from '../dto/request/assessment-item-query.dto.js';

@Injectable()
export class GetAssessmentItemsUseCase {
  constructor(
    private readonly assessmentItemRepository: IAssessmentItemRepository,
  ) {}
  async execute(query: AssessmentItemQueryDto) {
    return this.assessmentItemRepository.findAll({
      page: query.page,
      limit: query.limit,
      type: query.type,
      teachingAssignmentId: query.teachingAssignmentId,
    });
  }
}
