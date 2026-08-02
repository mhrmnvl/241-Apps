import { Injectable, NotFoundException } from '@nestjs/common';
import { IConditionRepository } from '../domain/interfaces/condition-repository.interface.js';
import { UpdateConditionDto } from '../dto/request/update-condition.dto.js';

@Injectable()
export class UpdateConditionUseCase {
  constructor(private readonly conditionRepository: IConditionRepository) {}

  async execute(id: string, dto: UpdateConditionDto) {
    const condition = await this.conditionRepository.findById(id);
    if (!condition) {
      throw new NotFoundException(`Condition with ID ${id} not found`);
    }
    return this.conditionRepository.update(id, {
      code: dto.code,
      name: dto.name,
      isUsable: dto.isUsable ?? true,
    });
  }
}
