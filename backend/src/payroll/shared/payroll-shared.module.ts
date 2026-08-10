import { Module } from '@nestjs/common';
import { AuditLogModule } from '../../platform/audit-log/audit-log.module.js';
import { PayrollAuditService } from './services/payroll-audit.service.js';

/** The audit trail is shared by runs and payslips, so it lives above both. */
@Module({
  imports: [AuditLogModule],
  providers: [PayrollAuditService],
  exports: [PayrollAuditService],
})
export class PayrollSharedModule {}
