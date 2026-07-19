import { Module } from '@nestjs/common';
import { EmploymentTypeController } from './controllers/employment-type.controller.js';
import { EmploymentTypeRepository } from './repositories/employment-type.repository.js';
import { IEmploymentTypeRepository } from './interfaces/employment-type-repository.interface.js';
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
      useClass: EmploymentTypeRepository,
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
