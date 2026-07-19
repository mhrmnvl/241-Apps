import { Module } from '@nestjs/common';
import { FundingSourceController } from './presentation/funding-source.controller.js';
import { FundingSourceRepository } from './infrastructure/persistence/prisma-funding-source.repository.js';
import { IFundingSourceRepository } from './domain/interfaces/funding-source-repository.interface.js';
import { CreateFundingSourceUseCase } from './use-cases/create-funding-source.use-case.js';
import { DeleteFundingSourceUseCase } from './use-cases/delete-funding-source.use-case.js';
import { GetFundingSourcesUseCase } from './use-cases/get-funding-sources.use-case.js';
import { UpdateFundingSourceUseCase } from './use-cases/update-funding-source.use-case.js';

@Module({
  controllers: [FundingSourceController],
  providers: [
    { provide: IFundingSourceRepository, useClass: FundingSourceRepository },
    GetFundingSourcesUseCase,
    CreateFundingSourceUseCase,
    UpdateFundingSourceUseCase,
    DeleteFundingSourceUseCase,
  ],
  exports: [IFundingSourceRepository],
})
export class FundingSourceModule {}
