import { Module } from '@nestjs/common';
import { CategoryModule } from './category/category.module.js';
import { ConditionModule } from './condition/condition.module.js';
import { FundingSourceModule } from './funding-source/funding-source.module.js';
import { LocationModule } from './location/location.module.js';
import { StatusModule } from './status/status.module.js';
import { MetadataController } from './presentation/metadata.controller.js';
import { GetMetadataUseCase } from './use-cases/get-metadata.use-case.js';

@Module({
  imports: [
    CategoryModule,
    ConditionModule,
    FundingSourceModule,
    LocationModule,
    StatusModule,
  ],
  controllers: [MetadataController],
  providers: [GetMetadataUseCase],
  exports: [
    CategoryModule,
    ConditionModule,
    FundingSourceModule,
    LocationModule,
    StatusModule,
  ],
})
export class MasterDataModule {}
