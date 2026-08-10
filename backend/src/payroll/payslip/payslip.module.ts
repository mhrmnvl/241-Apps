import { Module } from '@nestjs/common';
import { PayrollSharedModule } from '../shared/payroll-shared.module.js';
import { PayrollAccessFilter } from '../shared/filters/payroll-access.filter.js';
import { IPayslipRepository } from './domain/interfaces/payslip-repository.interface.js';
import { PrismaPayslipRepository } from './infrastructure/persistence/prisma-payslip.repository.js';
import { PayslipController } from './presentation/payslip.controller.js';
import { GetMyPayslipUseCase } from './use-cases/get-my-payslip.use-case.js';
import {
  GetPayslipByIdUseCase,
  GetRunPayslipsUseCase,
} from './use-cases/get-payslip-by-id.use-case.js';

@Module({
  imports: [PayrollSharedModule],
  controllers: [PayslipController],
  providers: [
    { provide: IPayslipRepository, useClass: PrismaPayslipRepository },
    // Declared as a provider so Nest injects the audit service into it.
    PayrollAccessFilter,
    GetMyPayslipUseCase,
    GetPayslipByIdUseCase,
    GetRunPayslipsUseCase,
  ],
  exports: [IPayslipRepository],
})
export class PayslipModule {}
