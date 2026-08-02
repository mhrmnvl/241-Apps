import { Module } from '@nestjs/common';
import { EmploymentTypeController } from './presentation/employment-type.controller.js';
import { PrismaEmploymentTypeRepository } from './infrastructure/persistence/prisma-employment-type.repository.js';
import { IEmploymentTypeRepository } from './domain/interfaces/employment-type-repository.interface.js';
import { CreateEmploymentTypeUseCase } from './use-cases/create-employment-type.use-case.js';
import { GetEmploymentTypesUseCase } from './use-cases/get-employment-types.use-case.js';
import { GetEmploymentTypeByIdUseCase } from './use-cases/get-employment-type-by-id.use-case.js';
import { UpdateEmploymentTypeUseCase } from './use-cases/update-employment-type.use-case.js';
import { DeleteEmploymentTypeUseCase } from './use-cases/delete-employment-type.use-case.js';

@Module({
  controllers: [EmploymentTypeController],
  providers: [
    {
      provide: IEmploymentTypeRepository,
      useClass: PrismaEmploymentTypeRepository,
    },
    CreateEmploymentTypeUseCase,
    GetEmploymentTypesUseCase,
    GetEmploymentTypeByIdUseCase,
    UpdateEmploymentTypeUseCase,
    DeleteEmploymentTypeUseCase,
  ],
  exports: [IEmploymentTypeRepository],
})
export class EmploymentTypeModule {}
