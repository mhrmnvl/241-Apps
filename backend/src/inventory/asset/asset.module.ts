import { Module } from '@nestjs/common';
import { AssetController } from './presentation/asset.controller.js';
import { PrismaAssetRepository } from './infrastructure/persistence/prisma-asset.repository.js';
import { IAssetRepository } from './domain/interfaces/asset-repository.interface.js';
import { CreateAssetUseCase } from './use-cases/create-asset.use-case.js';
import { DeleteAssetUseCase } from './use-cases/delete-asset.use-case.js';
import { GetAssetByIdUseCase } from './use-cases/get-asset-by-id.use-case.js';
import { GetAssetsUseCase } from './use-cases/get-assets.use-case.js';
import { UpdateAssetUseCase } from './use-cases/update-asset.use-case.js';

@Module({
  controllers: [AssetController],
  providers: [
    { provide: IAssetRepository, useClass: PrismaAssetRepository },
    GetAssetsUseCase,
    GetAssetByIdUseCase,
    CreateAssetUseCase,
    UpdateAssetUseCase,
    DeleteAssetUseCase,
  ],
  exports: [IAssetRepository],
})
export class AssetModule {}
