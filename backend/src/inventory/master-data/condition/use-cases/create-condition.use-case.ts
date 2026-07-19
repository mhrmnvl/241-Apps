import { Injectable } from '@nestjs/common';
import { IConditionRepository } from '../domain/interfaces/condition-repository.interface.js';
import { CreateConditionDto } from '../dto/condition.dto.js';

@Injectable()
export class CreateConditionUseCase {
  constructor(private readonly repository: IConditionRepository) {}

  async execute(dto: CreateConditionDto) {
    return this.repository.create({
      code: dto.code,
      name: dto.name,
      isUsable: dto.isUsable ?? true,
    });
  }
}
