import { Injectable } from '@nestjs/common';
import { IAssetRepository } from '../domain/interfaces/asset-repository.interface.js';
import { AssetQueryDto } from '../dto/request/asset-query.dto.js';

@Injectable()
export class GetAssetsUseCase {
  constructor(private readonly assetRepository: IAssetRepository) {}

  async execute(query: AssetQueryDto) {
    return this.assetRepository.findAll({
      page: query.page,
      limit: query.limit,
      keyword: query.keyword,
      categoryId: query.categoryId,
      locationId: query.locationId,
      statusId: query.statusId,
      conditionId: query.conditionId,
      fundingSourceId: query.fundingSourceId,
    });
  }
}
