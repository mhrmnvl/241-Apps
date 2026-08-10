import { Module } from '@nestjs/common';
import { SalaryAssignmentModule } from './assignment/assignment.module.js';
import { SalaryComponentModule } from './component/component.module.js';
import { PayslipModule } from './payslip/payslip.module.js';
import { PayrollRunModule } from './run/run.module.js';

/**
 * The only place in this codebase that holds salary.
 *
 * Every permission guarding this domain carries the `payroll-` prefix, which is
 * exempt from the `ADMIN` role bypass (ADR-0008) — holding an administrative
 * role confers nothing here, and each permission must be granted explicitly.
 */
@Module({
  imports: [
    SalaryComponentModule,
    SalaryAssignmentModule,
    PayrollRunModule,
    PayslipModule,
  ],
  exports: [
    SalaryComponentModule,
    SalaryAssignmentModule,
    PayrollRunModule,
    PayslipModule,
  ],
})
export class PayrollModule {}
