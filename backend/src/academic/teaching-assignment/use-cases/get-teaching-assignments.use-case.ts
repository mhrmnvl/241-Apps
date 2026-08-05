import { Injectable } from '@nestjs/common';
import { TeachingAssignmentQueryDto } from '../dto/request/teaching-assignment-query.dto.js';
import { ITeachingAssignmentRepository } from '../domain/interfaces/teaching-assignment-repository.interface.js';

@Injectable()
export class GetTeachingAssignmentsUseCase {
  constructor(
    private readonly teachingAssignmentRepository: ITeachingAssignmentRepository,
  ) {}

  async execute(query: TeachingAssignmentQueryDto) {
    // Explicit mapping keeps HTTP-only query fields from reaching the port.
    return this.teachingAssignmentRepository.findAll({
      page: query.page,
      limit: query.limit,
      teacherId: query.teacherId,
      classroomId: query.classroomId,
      subjectId: query.subjectId,
      semesterId: query.semesterId,
    });
  }
}
