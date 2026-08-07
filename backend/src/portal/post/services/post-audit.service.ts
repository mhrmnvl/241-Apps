import { Injectable, Logger } from '@nestjs/common';
import { CreateAuditLogUseCase } from '../../../platform/audit-log/use-cases/create-audit-log.use-case.js';
import { PostWithDetails } from '../domain/interfaces/post-repository.interface.js';
import {
  AUDIT_RESOURCE,
  PostAuditAction,
} from '../constants/post.constants.js';

/**
 * Records the three actions that change what the public can see (FR-064).
 *
 * The portal is the first module in this codebase to actually write `AuditLog`
 * rows — the infrastructure existed but nothing used it — so the failure policy
 * is stated here rather than assumed:
 *
 * **A failed audit write does not fail the operation.** By the time this runs
 * the post has already been published, unpublished, or deleted; throwing would
 * report failure for something that demonstrably happened, and leave the editor
 * retrying an action that already took effect. The write is awaited so a slow
 * audit table shows up as a slow request rather than silently dropping rows,
 * and a failure is logged at error level so it is visible rather than invisible.
 *
 * A stateless helper, not a business operation — which is what `services/` is
 * for. It is deliberately not a use case: nothing calls it on its own.
 */
@Injectable()
export class PostAuditService {
  private readonly logger = new Logger(PostAuditService.name);

  constructor(private readonly createAuditLog: CreateAuditLogUseCase) {}

  async record(
    action: PostAuditAction,
    post: Pick<PostWithDetails, 'id' | 'type' | 'title' | 'slug'>,
    actorId: string | null,
  ): Promise<void> {
    try {
      await this.createAuditLog.execute({
        userId: actorId,
        action,
        resource: AUDIT_RESOURCE,
        resourceId: post.id,
        metadata: { type: post.type, title: post.title, slug: post.slug },
      });
    } catch (error) {
      this.logger.error(
        `Audit write failed for ${action} on post ${post.id}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
