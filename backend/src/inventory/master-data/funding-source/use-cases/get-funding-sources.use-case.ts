import { Injectable } from '@nestjs/common';
import { IFundingSourceRepository } from '../domain/interfaces/funding-source-repository.interface.js';

@Injectable()
export class GetFundingSourcesUseCase {
  constructor(private readonly repository: IFundingSourceRepository) {}

  async execute(search?: string) {
    return this.repository.findMany(search);
  }
}
