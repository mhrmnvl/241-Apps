import { Injectable, NotFoundException } from '@nestjs/common';
import { IAssessmentItemRepository } from '../domain/interfaces/assessment-items-repository.interface.js';

@Injectable()
export class GetAssessmentItemByIdUseCase {
  constructor(
    private readonly assessmentItemRepository: IAssessmentItemRepository,
  ) {}
  async execute(id: string) {
    const item = await this.assessmentItemRepository.findById(id);
    if (!item) {
      throw new NotFoundException('Assessment item not found');
    }
    return item;
  }
}
