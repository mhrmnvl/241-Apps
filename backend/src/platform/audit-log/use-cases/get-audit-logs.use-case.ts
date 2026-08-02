import { Injectable } from '@nestjs/common';
import { IAuditLogRepository } from '../domain/interfaces/audit-log-repository.interface.js';
import { AuditLogQueryDto } from '../dto/request/audit-log-query.dto.js';

@Injectable()
export class GetAuditLogsUseCase {
  constructor(private readonly auditLogRepository: IAuditLogRepository) {}

  async execute(query: AuditLogQueryDto) {
    return this.auditLogRepository.findAll(query);
  }
}
