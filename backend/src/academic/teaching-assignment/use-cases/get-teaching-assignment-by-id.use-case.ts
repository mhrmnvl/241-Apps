import { Injectable, NotFoundException } from '@nestjs/common';
import { ITeachingAssignmentRepository } from '../domain/interfaces/teaching-assignment-repository.interface.js';

@Injectable()
export class GetTeachingAssignmentByIdUseCase {
  constructor(private readonly repository: ITeachingAssignmentRepository) {}

  async execute(id: string) {
    const result = await this.repository.findById(id);
    if (!result)
      throw new NotFoundException(`Teaching assignment ${id} not found`);
    return result;
  }
}
