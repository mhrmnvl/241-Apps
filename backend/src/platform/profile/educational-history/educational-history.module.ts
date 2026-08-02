import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../core/database/prisma.module.js';
import { EducationalHistoryController } from './presentation/educational-history.controller.js';
import { PrismaEducationalHistoryRepository } from './infrastructure/persistence/prisma-educational-history.repository.js';
import { IEducationalHistoryRepository } from './domain/interfaces/educational-history-repository.interface.js';
import { CreateEducationalHistoryUseCase } from './use-cases/create-educational-history.use-case.js';
import { GetEducationalHistoriesUseCase } from './use-cases/get-educational-histories.use-case.js';
import { GetEducationalHistoryByIdUseCase } from './use-cases/get-educational-history-by-id.use-case.js';
import { UpdateEducationalHistoryUseCase } from './use-cases/update-educational-history.use-case.js';
import { DeleteEducationalHistoryUseCase } from './use-cases/delete-educational-history.use-case.js';

@Module({
  imports: [PrismaModule],
  controllers: [EducationalHistoryController],
  providers: [
    {
      provide: IEducationalHistoryRepository,
      useClass: PrismaEducationalHistoryRepository,
    },
    CreateEducationalHistoryUseCase,
    GetEducationalHistoriesUseCase,
    GetEducationalHistoryByIdUseCase,
    UpdateEducationalHistoryUseCase,
    DeleteEducationalHistoryUseCase,
  ],
  exports: [IEducationalHistoryRepository],
})
export class EducationalHistoryModule {}
