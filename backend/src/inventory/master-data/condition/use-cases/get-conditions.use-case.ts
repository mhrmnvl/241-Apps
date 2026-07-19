import { Injectable } from '@nestjs/common';
import { IConditionRepository } from '../domain/interfaces/condition-repository.interface.js';

@Injectable()
export class GetConditionsUseCase {
  constructor(private readonly repository: IConditionRepository) {}

  async execute(search?: string) {
    return this.repository.findMany(search);
  }
}
