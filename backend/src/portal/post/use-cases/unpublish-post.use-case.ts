import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { POST_AUDIT_ACTIONS } from '../constants/post.constants.js';
import { IPostRepository } from '../domain/interfaces/post-repository.interface.js';
import { PostVersionDto } from '../dto/request/post-version.dto.js';
import { toAdminDetail } from '../infrastructure/mappers/post.mapper.js';
import { PostAuditService } from '../services/post-audit.service.js';
import { PortalCacheService } from '../../shared/services/portal-cache.service.js';

/**
 * Takes an item back off the public site (FR-017).
 *
 * `publishedAt` is cleared, which is the whole difference from archiving: a
 * later republish is a fresh publication with a fresh date, because the item
 * was withdrawn rather than filed. The visibility predicate reads `publishedAt`,
 * so clearing it removes the item from every public surface at once — listings,
 * homepage, sitemap, and the images it introduced (research R2).
 */
@Injectable()
export class UnpublishPostUseCase {
  private readonly logger = new Logger(UnpublishPostUseCase.name);

  constructor(
    private readonly postRepository: IPostRepository,
    private readonly audit: PostAuditService,
    private readonly cache: PortalCacheService,
  ) {}

  async execute(id: string, dto: PostVersionDto, actorId: string | null) {
    const existing = await this.postRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Konten dengan ID ${id} not found`);
    }

    const updated = await this.postRepository.unpublish(id, dto.version);
    if (!updated) {
      throw new ConflictException(
        'This content was changed by someone else. Reload before unpublishing.',
      );
    }

    await this.audit.record(POST_AUDIT_ACTIONS.UNPUBLISH, updated, actorId);
    await this.cache.invalidate();

    this.logger.log(`Post unpublished: "${updated.title}"`);
    return toAdminDetail(updated);
  }
}
