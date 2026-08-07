import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { POST_AUDIT_ACTIONS } from '../constants/post.constants.js';
import { IPostRepository } from '../domain/interfaces/post-repository.interface.js';
import { PostAuditService } from '../services/post-audit.service.js';
import { PortalCacheService } from '../../shared/services/portal-cache.service.js';

/**
 * Soft delete only (FR-019).
 *
 * `deletedAt` is set and nothing else changes — in particular `status` is left
 * alone, which is what lets a restore return the item to exactly the state it
 * was in rather than to a guess.
 *
 * A deleted item disappears from the public site immediately: every public
 * query starts from `deletedAt: null`. Deleting a never-published draft is
 * therefore indistinguishable, from outside, from deleting nothing at all.
 */
@Injectable()
export class DeletePostUseCase {
  private readonly logger = new Logger(DeletePostUseCase.name);

  constructor(
    private readonly postRepository: IPostRepository,
    private readonly audit: PostAuditService,
    private readonly cache: PortalCacheService,
  ) {}

  async execute(id: string, actorId: string | null): Promise<void> {
    const existing = await this.postRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Konten dengan ID ${id} tidak ditemukan`);
    }

    await this.postRepository.softDelete(id);
    await this.audit.record(POST_AUDIT_ACTIONS.DELETE, existing, actorId);
    await this.cache.invalidate();

    this.logger.log(`Post soft-deleted: "${existing.title}"`);
  }
}
