import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuditLogRepository } from '../repositories/audit-log.repository.js';

@Injectable()
export class CreateAuditLogUseCase {
  private readonly logger = new Logger(CreateAuditLogUseCase.name);

  constructor(private readonly auditLogsRepo: AuditLogRepository) {}

  async execute(data: {
    userId?: string | null;
    action: string;
    resource: string;
    resourceId?: string | null;
    metadata?: Prisma.InputJsonValue;
    ipAddress?: string | null;
    userAgent?: string | null;
  }) {
    const log = await this.auditLogsRepo.create(data);
    this.logger.log(`Audit log created: ${log.action} on ${log.resource}`);
    return log;
  }
}
