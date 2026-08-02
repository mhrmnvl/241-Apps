import { Injectable, NotFoundException } from '@nestjs/common';
import { ITeachingAssignmentRepository } from '../domain/interfaces/teaching-assignment-repository.interface.js';

@Injectable()
export class DeleteTeachingAssignmentUseCase {
  constructor(
    private readonly teachingAssignmentRepository: ITeachingAssignmentRepository,
  ) {}

  async execute(id: string) {
    const result = await this.teachingAssignmentRepository.findById(id);
    if (!result)
      throw new NotFoundException(`Teaching assignment ${id} not found`);
    return this.teachingAssignmentRepository.softDelete(id);
  }
}
