import { JsonObject } from '../../../../shared/domain/types/json.type.js';
import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../../shared/domain/interfaces/repository.interface.js';
import { AuditLogEntity } from '../entities/audit-log.entity.js';

export interface AuditLogQueryInput extends PaginationQueryInput {
  search?: string;
  userId?: string;
  action?: string;
  resource?: string;
}

export interface CreateAuditLogData {
  userId?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  metadata?: JsonObject;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export abstract class IAuditLogRepository {
  abstract findAll(
    query: AuditLogQueryInput,
  ): Promise<PaginatedResult<AuditLogEntity>>;

  abstract create(data: CreateAuditLogData): Promise<AuditLogEntity>;
}
