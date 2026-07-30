import { Injectable } from '@nestjs/common';
import { IAssessmentItemsRepository } from '../domain/interfaces/assessment-items-repository.interface.js';
import { AssessmentItemQueryDto } from '../dto/request/assessment-item-query.dto.js';

@Injectable()
export class GetAssessmentItemsUseCase {
  constructor(private readonly repo: IAssessmentItemsRepository) {}
  async execute(query: AssessmentItemQueryDto) {
    return this.repo.findAll(query);
  }
}
