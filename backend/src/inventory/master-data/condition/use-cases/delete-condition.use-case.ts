import { Injectable, NotFoundException } from '@nestjs/common';
import { IConditionRepository } from '../domain/interfaces/condition-repository.interface.js';

@Injectable()
export class DeleteConditionUseCase {
  constructor(private readonly repository: IConditionRepository) {}

  async execute(id: string) {
    const condition = await this.repository.findById(id);
    if (!condition) {
      throw new NotFoundException(`Condition with ID ${id} not found`);
    }
    return this.repository.delete(id);
  }
}
