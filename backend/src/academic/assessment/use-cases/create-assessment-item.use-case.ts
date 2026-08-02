import { BadRequestException, Injectable } from '@nestjs/common';
import { IAssessmentItemRepository } from '../domain/interfaces/assessment-item-repository.interface.js';
import { ITeachingAssignmentRepository } from '../../teaching-assignment/domain/interfaces/teaching-assignment-repository.interface.js';
import { CreateAssessmentItemDto } from '../dto/request/create-assessment-item.dto.js';

@Injectable()
export class CreateAssessmentItemUseCase {
  constructor(
    private readonly assessmentItemRepository: IAssessmentItemRepository,
    private readonly teachingAssignmentRepository: ITeachingAssignmentRepository,
  ) {}
  async execute(dto: CreateAssessmentItemDto) {
    const ta = await this.teachingAssignmentRepository.findById(
      dto.teachingAssignmentId,
    );
    if (!ta) {
      throw new BadRequestException('Teaching assignment not found');
    }
    return this.assessmentItemRepository.create(dto);
  }
}
