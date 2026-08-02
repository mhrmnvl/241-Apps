import { Injectable, NotFoundException } from '@nestjs/common';
import { IFundingSourceRepository } from '../domain/interfaces/funding-source-repository.interface.js';

@Injectable()
export class DeleteFundingSourceUseCase {
  constructor(
    private readonly fundingSourceRepository: IFundingSourceRepository,
  ) {}

  async execute(id: string) {
    const fundingSource = await this.fundingSourceRepository.findById(id);
    if (!fundingSource) {
      throw new NotFoundException(`Funding Source with ID ${id} not found`);
    }
    return this.fundingSourceRepository.delete(id);
  }
}
