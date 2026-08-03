import { JsonValue } from '../../../../shared/domain/types/json.type.js';
export interface AuditLogEntity {
  id: string;
  userId?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  metadata?: JsonValue | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
}
