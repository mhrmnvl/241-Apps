import { Module } from '@nestjs/common';
import { PositionController } from './presentation/position.controller.js';
import { PrismaPositionRepository } from './infrastructure/persistence/prisma-position.repository.js';
import { IPositionRepository } from './domain/interfaces/position-repository.interface.js';
import { CreatePositionUseCase } from './use-cases/create-position.use-case.js';
import { DeletePositionUseCase } from './use-cases/delete-position.use-case.js';
import { GetPositionByIdUseCase } from './use-cases/get-position-by-id.use-case.js';
import { GetPositionsUseCase } from './use-cases/get-positions.use-case.js';
import { UpdatePositionUseCase } from './use-cases/update-position.use-case.js';

@Module({
  controllers: [PositionController],
  providers: [
    { provide: IPositionRepository, useClass: PrismaPositionRepository },
    GetPositionsUseCase,
    GetPositionByIdUseCase,
    CreatePositionUseCase,
    UpdatePositionUseCase,
    DeletePositionUseCase,
  ],
  exports: [IPositionRepository],
})
export class PositionModule {}
