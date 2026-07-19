import { Module } from '@nestjs/common';
import { AchievementTypeController } from './presentation/achievement-type.controller.js';
import { PrismaAchievementTypeRepository } from './infrastructure/persistence/prisma-achievement-type.repository.js';
import { IAchievementTypeRepository } from './domain/interfaces/achievement-type-repository.interface.js';
import { CreateAchievementTypeUseCase } from './use-cases/create-achievement-type.use-case.js';
import { DeleteAchievementTypeUseCase } from './use-cases/delete-achievement-type.use-case.js';
import { GetAchievementTypeByIdUseCase } from './use-cases/get-achievement-type-by-id.use-case.js';
import { GetAchievementTypesUseCase } from './use-cases/get-achievement-types.use-case.js';
import { UpdateAchievementTypeUseCase } from './use-cases/update-achievement-type.use-case.js';

@Module({
  controllers: [AchievementTypeController],
  providers: [
    {
      provide: IAchievementTypeRepository,
      useClass: PrismaAchievementTypeRepository,
    },
    GetAchievementTypesUseCase,
    GetAchievementTypeByIdUseCase,
    CreateAchievementTypeUseCase,
    UpdateAchievementTypeUseCase,
    DeleteAchievementTypeUseCase,
  ],
  exports: [IAchievementTypeRepository],
})
export class AchievementTypeModule {}
