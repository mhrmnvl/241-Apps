import { Injectable, NotFoundException } from '@nestjs/common';
import { IAssetRepository } from '../domain/interfaces/asset-repository.interface.js';

@Injectable()
export class GetAssetByIdUseCase {
  constructor(private readonly assetRepository: IAssetRepository) {}

  async execute(id: string) {
    const asset = await this.assetRepository.findById(id);
    if (!asset) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }
    return asset;
  }
}
