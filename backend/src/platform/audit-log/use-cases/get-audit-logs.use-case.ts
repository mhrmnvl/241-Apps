import { Injectable } from '@nestjs/common';
import { AuditLogRepository } from '../repositories/audit-log.repository.js';
import { AuditLogQueryDto } from '../dto/request/audit-log-query.dto.js';

@Injectable()
export class GetAuditLogsUseCase {
  constructor(private readonly auditLogsRepo: AuditLogRepository) {}

  async execute(query: AuditLogQueryDto) {
    return this.auditLogsRepo.findAll(query);
  }
}
