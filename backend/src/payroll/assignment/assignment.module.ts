import { Module } from '@nestjs/common';
import { SalaryComponentModule } from '../component/component.module.js';
import { ISalaryAssignmentRepository } from './domain/interfaces/salary-assignment-repository.interface.js';
import { PrismaSalaryAssignmentRepository } from './infrastructure/persistence/prisma-salary-assignment.repository.js';
import { SalaryAssignmentController } from './presentation/salary-assignment.controller.js';
import {
  CreateSalaryAssignmentUseCase,
  DeleteSalaryAssignmentUseCase,
  GetSalaryAssignmentsUseCase,
} from './use-cases/manage-salary-assignment.use-case.js';

@Module({
  imports: [SalaryComponentModule],
  controllers: [SalaryAssignmentController],
  providers: [
    {
      provide: ISalaryAssignmentRepository,
      useClass: PrismaSalaryAssignmentRepository,
    },
    GetSalaryAssignmentsUseCase,
    CreateSalaryAssignmentUseCase,
    DeleteSalaryAssignmentUseCase,
  ],
  exports: [ISalaryAssignmentRepository],
})
export class SalaryAssignmentModule {}
