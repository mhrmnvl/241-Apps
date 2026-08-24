import { Injectable, Logger } from '@nestjs/common';
import { CreateAuditLogUseCase } from '../../../platform/audit-log/use-cases/create-audit-log.use-case.js';

export const PRESENCE_AUDIT_RESOURCE = 'presence-record';

export type PresenceAuditAction =
  'presence-record.create' | 'presence-record.correct';

/**
 * Records the two actions that change someone's attendance by hand (FR-052).
 *
 * **A failed audit write does not fail the correction.** By the time this runs
 * the record has already changed; throwing would report failure for something
 * that demonstrably happened and leave the TU staff retrying an edit that
 * already took effect. The write is awaited so a slow audit table shows up as a
 * slow request rather than silently dropping rows, and a failure is logged at
 * error level so it stays visible.
 *
 * This mirrors `portal/post/services/post-audit.service.ts` deliberately — the
 * policy should be identical wherever it appears, not re-argued per module.
 *
 * Note the belt and braces: `PresenceCorrection` is the module-local trail with
 * the before/after values, and `AuditLog` is the system-wide one. The former is
 * what the TU screen renders; the latter is what a school is asked to produce.
 */
@Injectable()
export class PresenceAuditService {
  private readonly logger = new Logger(PresenceAuditService.name);

  constructor(private readonly createAuditLog: CreateAuditLogUseCase) {}

  async record(
    action: PresenceAuditAction,
    dailyPresenceId: string,
    actorId: string,
    metadata: { subjectUserId: string; date: string; reason: string },
  ): Promise<void> {
    try {
      await this.createAuditLog.execute({
        userId: actorId,
        action,
        resource: PRESENCE_AUDIT_RESOURCE,
        resourceId: dailyPresenceId,
        metadata,
      });
    } catch (error) {
      this.logger.error(
        `Audit write failed for ${action} on presence ${dailyPresenceId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
