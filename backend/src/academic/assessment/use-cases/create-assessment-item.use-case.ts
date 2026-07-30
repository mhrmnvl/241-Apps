import { BadRequestException, Injectable } from '@nestjs/common';
import { IAssessmentItemsRepository } from '../domain/interfaces/assessment-items-repository.interface.js';
import { ITeachingAssignmentRepository } from '../../teaching-assignment/domain/interfaces/teaching-assignment-repository.interface.js';
import { CreateAssessmentItemDto } from '../dto/request/create-assessment-item.dto.js';

@Injectable()
export class CreateAssessmentItemUseCase {
  constructor(
    private readonly repo: IAssessmentItemsRepository,
    private readonly teachingAssignmentRepository: ITeachingAssignmentRepository,
  ) {}
  async execute(dto: CreateAssessmentItemDto) {
    const ta = await this.teachingAssignmentRepository.findById(
      dto.teachingAssignmentId,
    );
    if (!ta) {
      throw new BadRequestException('Teaching assignment not found');
    }
    return this.repo.create(dto);
  }
}
