import { Module } from '@nestjs/common';
import { ConditionController } from './presentation/condition.controller.js';
import { ConditionRepository } from './infrastructure/persistence/prisma-condition.repository.js';
import { IConditionRepository } from './domain/interfaces/condition-repository.interface.js';
import { CreateConditionUseCase } from './use-cases/create-condition.use-case.js';
import { DeleteConditionUseCase } from './use-cases/delete-condition.use-case.js';
import { GetConditionsUseCase } from './use-cases/get-conditions.use-case.js';
import { UpdateConditionUseCase } from './use-cases/update-condition.use-case.js';

@Module({
  controllers: [ConditionController],
  providers: [
    { provide: IConditionRepository, useClass: ConditionRepository },
    GetConditionsUseCase,
    CreateConditionUseCase,
    UpdateConditionUseCase,
    DeleteConditionUseCase,
  ],
  exports: [IConditionRepository],
})
export class ConditionModule {}
