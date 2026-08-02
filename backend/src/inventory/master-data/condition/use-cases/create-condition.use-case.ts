import { Injectable } from '@nestjs/common';
import { IConditionRepository } from '../domain/interfaces/condition-repository.interface.js';
import { CreateConditionDto } from '../dto/request/create-condition.dto.js';

@Injectable()
export class CreateConditionUseCase {
  constructor(private readonly conditionRepository: IConditionRepository) {}

  async execute(dto: CreateConditionDto) {
    return this.conditionRepository.create({
      code: dto.code,
      name: dto.name,
      isUsable: dto.isUsable ?? true,
    });
  }
}
