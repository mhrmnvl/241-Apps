import { Injectable } from '@nestjs/common';
import { TeachingAssignmentQueryDto } from '../dto/request/teaching-assignment-query.dto.js';
import { ITeachingAssignmentRepository } from '../domain/interfaces/teaching-assignment-repository.interface.js';

@Injectable()
export class GetTeachingAssignmentsUseCase {
  constructor(
    private readonly teachingAssignmentRepository: ITeachingAssignmentRepository,
  ) {}

  async execute(query: TeachingAssignmentQueryDto) {
    return this.teachingAssignmentRepository.findAll(query);
  }
}
