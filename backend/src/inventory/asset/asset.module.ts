import { Module } from '@nestjs/common';
import { AssetController } from './presentation/asset.controller.js';
import { AssetUnitController } from './presentation/asset-unit.controller.js';
import { PrismaAssetRepository } from './infrastructure/persistence/prisma-asset.repository.js';
import { PrismaAssetUnitRepository } from './infrastructure/persistence/prisma-asset-unit.repository.js';
import { IAssetRepository } from './domain/interfaces/asset-repository.interface.js';
import { IAssetUnitRepository } from './domain/interfaces/asset-unit-repository.interface.js';
import { CreateAssetUseCase } from './use-cases/create-asset.use-case.js';
import { DeleteAssetUseCase } from './use-cases/delete-asset.use-case.js';
import { GetAssetByIdUseCase } from './use-cases/get-asset-by-id.use-case.js';
import { GetAssetsUseCase } from './use-cases/get-assets.use-case.js';
import { UpdateAssetUseCase } from './use-cases/update-asset.use-case.js';
import { AddUnitsUseCase } from './use-cases/add-units.use-case.js';
import { UpdateUnitUseCase } from './use-cases/update-unit.use-case.js';
import { DeleteUnitUseCase } from './use-cases/delete-unit.use-case.js';

@Module({
  controllers: [AssetController, AssetUnitController],
  providers: [
    { provide: IAssetRepository, useClass: PrismaAssetRepository },
    { provide: IAssetUnitRepository, useClass: PrismaAssetUnitRepository },
    GetAssetsUseCase,
    GetAssetByIdUseCase,
    CreateAssetUseCase,
    UpdateAssetUseCase,
    DeleteAssetUseCase,
    AddUnitsUseCase,
    UpdateUnitUseCase,
    DeleteUnitUseCase,
  ],
  exports: [IAssetRepository, IAssetUnitRepository],
})
export class AssetModule {}
