import { Injectable, Logger } from '@nestjs/common';
import { JsonObject } from '../../../shared/domain/types/json.type.js';
import { CreateAuditLogUseCase } from '../../../platform/audit-log/use-cases/create-audit-log.use-case.js';

export const PAYROLL_AUDIT_RESOURCE = 'payroll';

export type PayrollAuditAction =
  | 'payroll.run.create'
  | 'payroll.run.recalculate'
  | 'payroll.run.submit'
  | 'payroll.run.approve'
  | 'payroll.payslip.read'
  | 'payroll.payslip.read-own'
  | 'payroll.payslip.denied';

/**
 * Records every access to salary data, granted or refused (FR-052).
 *
 * Portal writes audit rows as a convenience; here the trail **is** the control.
 * A refusal is recorded as deliberately as a success — an employee reaching for
 * someone else's payslip is exactly the event this exists to make reviewable,
 * and it is the one case where nothing else in the system leaves a trace.
 *
 * Failure policy follows `PostAuditService`: awaited, so a slow audit table
 * shows up as a slow request rather than silently dropping rows, but a failed
 * write is logged rather than thrown — the read it describes already happened.
 */
@Injectable()
export class PayrollAuditService {
  private readonly logger = new Logger(PayrollAuditService.name);

  constructor(private readonly createAuditLog: CreateAuditLogUseCase) {}

  async record(
    action: PayrollAuditAction,
    actorId: string | null,
    resourceId: string | null,
    metadata: JsonObject = {},
  ): Promise<void> {
    try {
      await this.createAuditLog.execute({
        userId: actorId,
        action,
        resource: PAYROLL_AUDIT_RESOURCE,
        resourceId,
        metadata,
      });
    } catch (error) {
      this.logger.error(
        `Audit write failed for ${action} on ${resourceId ?? 'payroll'}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
