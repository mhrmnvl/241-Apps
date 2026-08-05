import { Injectable, NotFoundException } from '@nestjs/common';
import { IAssessmentItemRepository } from '../domain/interfaces/assessment-item-repository.interface.js';
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
    // The teaching assignment is fixed: an item cannot be moved to another
    // class or teacher once scores hang off it.
    return this.assessmentItemRepository.update(id, {
      name: dto.name,
      type: dto.type,
      weight: dto.weight,
      maxScore: dto.maxScore,
    });
  }
}
