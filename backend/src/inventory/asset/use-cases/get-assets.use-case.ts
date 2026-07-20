import { Injectable } from '@nestjs/common';
import { IAssetRepository } from '../domain/interfaces/asset-repository.interface.js';
import { AssetQueryDto } from '../dto/request/asset-query.dto.js';

@Injectable()
export class GetAssetsUseCase {
  constructor(private readonly repository: IAssetRepository) {}

  async execute(query: AssetQueryDto) {
    return this.repository.findAll(query);
  }
}
