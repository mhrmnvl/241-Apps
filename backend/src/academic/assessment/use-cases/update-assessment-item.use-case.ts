import { Injectable, NotFoundException } from '@nestjs/common';
import { IAssessmentItemsRepository } from '../domain/interfaces/assessment-items-repository.interface.js';
import { UpdateAssessmentItemDto } from '../dto/request/update-assessment-item.dto.js';

@Injectable()
export class UpdateAssessmentItemUseCase {
  constructor(private readonly repo: IAssessmentItemsRepository) {}
  async execute(id: string, dto: UpdateAssessmentItemDto) {
    const r = await this.repo.findById(id);
    if (!r) throw new NotFoundException(`AssessmentItem ${id} not found`);
    return this.repo.update(id, dto);
  }
}
