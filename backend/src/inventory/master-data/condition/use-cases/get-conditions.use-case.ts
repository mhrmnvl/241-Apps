import { Injectable } from '@nestjs/common';
import { IConditionRepository } from '../domain/interfaces/condition-repository.interface.js';

@Injectable()
export class GetConditionsUseCase {
  constructor(private readonly conditionRepository: IConditionRepository) {}

  async execute(search?: string) {
    return this.conditionRepository.findMany(search);
  }
}
