import { Injectable, NotFoundException } from '@nestjs/common';
import { IFundingSourceRepository } from '../domain/interfaces/funding-source-repository.interface.js';
import { UpdateFundingSourceDto } from '../dto/request/update-funding-source.dto.js';

@Injectable()
export class UpdateFundingSourceUseCase {
  constructor(
    private readonly fundingSourceRepository: IFundingSourceRepository,
  ) {}

  async execute(id: string, dto: UpdateFundingSourceDto) {
    const fundingSource = await this.fundingSourceRepository.findById(id);
    if (!fundingSource) {
      throw new NotFoundException(`Funding Source with ID ${id} not found`);
    }
    return this.fundingSourceRepository.update(id, {
      code: dto.code,
      name: dto.name,
      description: dto.description ?? null,
    });
  }
}
