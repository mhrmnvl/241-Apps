import { Injectable } from '@nestjs/common';
import { IFundingSourceRepository } from '../domain/interfaces/funding-source-repository.interface.js';

@Injectable()
export class GetFundingSourcesUseCase {
  constructor(
    private readonly fundingSourceRepository: IFundingSourceRepository,
  ) {}

  async execute(search?: string) {
    return this.fundingSourceRepository.findMany(search);
  }
}
