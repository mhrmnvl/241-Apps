import { Injectable, NotFoundException } from '@nestjs/common';
import { IAssessmentItemsRepository } from '../domain/interfaces/assessment-items-repository.interface.js';

@Injectable()
export class DeleteAssessmentItemUseCase {
  constructor(private readonly repo: IAssessmentItemsRepository) {}
  async execute(id: string) {
    const r = await this.repo.findById(id);
    if (!r) throw new NotFoundException(`AssessmentItem ${id} not found`);
    return this.repo.softDelete(id);
  }
}
