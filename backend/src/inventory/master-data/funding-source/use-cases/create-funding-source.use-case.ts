import { Injectable } from '@nestjs/common';
import { IFundingSourceRepository } from '../domain/interfaces/funding-source-repository.interface.js';
import { CreateFundingSourceDto } from '../dto/request/create-funding-source.dto.js';

@Injectable()
export class CreateFundingSourceUseCase {
  constructor(
    private readonly fundingSourceRepository: IFundingSourceRepository,
  ) {}

  async execute(dto: CreateFundingSourceDto) {
    return this.fundingSourceRepository.create({
      code: dto.code,
      name: dto.name,
      description: dto.description ?? null,
    });
  }
}
