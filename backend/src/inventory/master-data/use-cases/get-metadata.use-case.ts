import { Injectable } from '@nestjs/common';
import { ICategoryRepository } from '../category/domain/interfaces/category-repository.interface.js';
import { ILocationRepository } from '../location/domain/interfaces/location-repository.interface.js';
import { IConditionRepository } from '../condition/domain/interfaces/condition-repository.interface.js';
import { IStatusRepository } from '../status/domain/interfaces/status-repository.interface.js';
import { IFundingSourceRepository } from '../funding-source/domain/interfaces/funding-source-repository.interface.js';

@Injectable()
export class GetMetadataUseCase {
  constructor(
    private readonly categoryRepo: ICategoryRepository,
    private readonly locationRepo: ILocationRepository,
    private readonly conditionRepo: IConditionRepository,
    private readonly statusRepo: IStatusRepository,
    private readonly fundingSourceRepo: IFundingSourceRepository,
  ) {}

  async execute() {
    const [categories, locations, conditions, statuses, fundingSources] =
      await Promise.all([
        this.categoryRepo.findMany(),
        this.locationRepo.findMany(),
        this.conditionRepo.findMany(),
        this.statusRepo.findMany(),
        this.fundingSourceRepo.findMany(),
      ]);

    return {
      categories,
      locations,
      conditions,
      statuses,
      fundingSources,
    };
  }
}
