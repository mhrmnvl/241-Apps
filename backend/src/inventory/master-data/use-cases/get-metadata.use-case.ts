import { Injectable } from '@nestjs/common';
import { ICategoryRepository } from '../category/domain/interfaces/category-repository.interface.js';
import { ILocationRepository } from '../location/domain/interfaces/location-repository.interface.js';
import { IConditionRepository } from '../condition/domain/interfaces/condition-repository.interface.js';
import { IStatusRepository } from '../status/domain/interfaces/status-repository.interface.js';
import { IFundingSourceRepository } from '../funding-source/domain/interfaces/funding-source-repository.interface.js';

@Injectable()
export class GetMetadataUseCase {
  constructor(
    private readonly categoryRepository: ICategoryRepository,
    private readonly locationRepository: ILocationRepository,
    private readonly conditionRepository: IConditionRepository,
    private readonly statusRepository: IStatusRepository,
    private readonly fundingSourceRepository: IFundingSourceRepository,
  ) {}

  async execute() {
    const [categories, locations, conditions, statuses, fundingSources] =
      await Promise.all([
        this.categoryRepository.findMany(),
        this.locationRepository.findMany(),
        this.conditionRepository.findMany(),
        this.statusRepository.findMany(),
        this.fundingSourceRepository.findMany(),
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
