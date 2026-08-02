import { Module } from '@nestjs/common';
import { AuditLogController } from './presentation/audit-log.controller.js';
import { PrismaAuditLogRepository } from './infrastructure/persistence/prisma-audit-log.repository.js';
import { IAuditLogRepository } from './domain/interfaces/audit-log-repository.interface.js';
import { GetAuditLogsUseCase } from './use-cases/get-audit-logs.use-case.js';
import { CreateAuditLogUseCase } from './use-cases/create-audit-log.use-case.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [AuditLogController],
  providers: [
    { provide: IAuditLogRepository, useClass: PrismaAuditLogRepository },
    GetAuditLogsUseCase,
    CreateAuditLogUseCase,
  ],
  exports: [IAuditLogRepository, CreateAuditLogUseCase],
})
export class AuditLogModule {}
