import { JsonObject } from '../../../shared/domain/types/json.type.js';
import { Injectable, Logger } from '@nestjs/common';
import { IAuditLogRepository } from '../domain/interfaces/audit-log-repository.interface.js';

@Injectable()
export class CreateAuditLogUseCase {
  private readonly logger = new Logger(CreateAuditLogUseCase.name);

  constructor(private readonly auditLogRepository: IAuditLogRepository) {}

  async execute(data: {
    userId?: string | null;
    action: string;
    resource: string;
    resourceId?: string | null;
    metadata?: JsonObject;
    ipAddress?: string | null;
    userAgent?: string | null;
  }) {
    const log = await this.auditLogRepository.create(data);
    this.logger.log(`Audit log created: ${log.action} on ${log.resource}`);
    return log;
  }
}
