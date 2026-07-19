import { Module } from '@nestjs/common';
import { AuditLogController } from './presentation/audit-log.controller.js';
import { AuditLogRepository } from './repositories/audit-log.repository.js';
import { GetAuditLogsUseCase } from './use-cases/get-audit-logs.use-case.js';
import { CreateAuditLogUseCase } from './use-cases/create-audit-log.use-case.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [AuditLogController],
  providers: [AuditLogRepository, GetAuditLogsUseCase, CreateAuditLogUseCase],
  exports: [CreateAuditLogUseCase],
})
export class AuditLogModule {}
