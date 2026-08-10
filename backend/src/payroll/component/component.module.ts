import { Module } from '@nestjs/common';
import { ISalaryComponentRepository } from './domain/interfaces/salary-component-repository.interface.js';
import { PrismaSalaryComponentRepository } from './infrastructure/persistence/prisma-salary-component.repository.js';
import { SalaryComponentController } from './presentation/salary-component.controller.js';
import {
  CreateSalaryComponentUseCase,
  DeleteSalaryComponentUseCase,
  GetSalaryComponentsUseCase,
  UpdateSalaryComponentUseCase,
} from './use-cases/manage-salary-component.use-case.js';

@Module({
  controllers: [SalaryComponentController],
  providers: [
    {
      provide: ISalaryComponentRepository,
      useClass: PrismaSalaryComponentRepository,
    },
    GetSalaryComponentsUseCase,
    CreateSalaryComponentUseCase,
    UpdateSalaryComponentUseCase,
    DeleteSalaryComponentUseCase,
  ],
  exports: [ISalaryComponentRepository],
})
export class SalaryComponentModule {}
