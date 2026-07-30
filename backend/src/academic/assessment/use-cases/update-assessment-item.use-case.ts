import { Injectable, NotFoundException } from '@nestjs/common';
import { IAssessmentItemRepository } from '../domain/interfaces/assessment-items-repository.interface.js';
import { UpdateAssessmentItemDto } from '../dto/request/update-assessment-item.dto.js';

@Injectable()
export class UpdateAssessmentItemUseCase {
  constructor(
    private readonly assessmentItemRepository: IAssessmentItemRepository,
  ) {}
  async execute(id: string, dto: UpdateAssessmentItemDto) {
    const item = await this.assessmentItemRepository.findById(id);
    if (!item) {
      throw new NotFoundException('Assessment item not found');
    }
    return this.assessmentItemRepository.update(id, dto);
  }
}
