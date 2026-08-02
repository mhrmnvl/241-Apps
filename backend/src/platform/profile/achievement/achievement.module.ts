import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../core/database/prisma.module.js';
import { AchievementController } from './presentation/achievement.controller.js';
import { PrismaAchievementRepository } from './infrastructure/persistence/prisma-achievement.repository.js';
import { IAchievementRepository } from './domain/interfaces/achievement-repository.interface.js';
import { CreateAchievementUseCase } from './use-cases/create-achievement.use-case.js';
import { GetAchievementsUseCase } from './use-cases/get-achievements.use-case.js';
import { GetAchievementByIdUseCase } from './use-cases/get-achievement-by-id.use-case.js';
import { UpdateAchievementUseCase } from './use-cases/update-achievement.use-case.js';
import { DeleteAchievementUseCase } from './use-cases/delete-achievement.use-case.js';

@Module({
  imports: [PrismaModule],
  controllers: [AchievementController],
  providers: [
    {
      provide: IAchievementRepository,
      useClass: PrismaAchievementRepository,
    },
    CreateAchievementUseCase,
    GetAchievementsUseCase,
    GetAchievementByIdUseCase,
    UpdateAchievementUseCase,
    DeleteAchievementUseCase,
  ],
  exports: [IAchievementRepository],
})
export class AchievementModule {}
