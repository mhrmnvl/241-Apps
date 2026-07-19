import { Injectable, NotFoundException } from '@nestjs/common';
import { IFundingSourceRepository } from '../domain/interfaces/funding-source-repository.interface.js';
import { UpdateFundingSourceDto } from '../dto/funding-source.dto.js';

@Injectable()
export class UpdateFundingSourceUseCase {
  constructor(private readonly repository: IFundingSourceRepository) {}

  async execute(id: string, dto: UpdateFundingSourceDto) {
    const fundingSource = await this.repository.findById(id);
    if (!fundingSource) {
      throw new NotFoundException(`Funding Source with ID ${id} not found`);
    }
    return this.repository.update(id, {
      code: dto.code,
      name: dto.name,
      description: dto.description ?? null,
    });
  }
}
