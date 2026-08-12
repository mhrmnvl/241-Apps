import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { IPostRepository } from '../domain/interfaces/post-repository.interface.js';
import { PinPostDto } from '../dto/request/post-version.dto.js';
import { toAdminDetail } from '../infrastructure/mappers/post.mapper.js';
import { PortalCacheService } from '../../shared/services/portal-cache.service.js';

/**
 * Pins an item to the top of its feed, or unpins it (FR-030).
 *
 * Stored as a timestamp rather than a boolean so several pinned items order
 * among themselves — most recently pinned leads — which a flag cannot express.
 * `PUBLIC_POST_ORDER_BY` sorts `pinnedAt DESC NULLS LAST` before recency, so an
 * unpinned item simply falls back into date order with no second code path.
 */
@Injectable()
export class PinPostUseCase {
  private readonly logger = new Logger(PinPostUseCase.name);

  constructor(
    private readonly postRepository: IPostRepository,
    private readonly cache: PortalCacheService,
  ) {}

  async execute(id: string, dto: PinPostDto) {
    const existing = await this.postRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Konten dengan ID ${id} not found`);
    }

    const updated = await this.postRepository.pin(
      id,
      dto.version,
      dto.pinned ? new Date() : null,
    );
    if (!updated) {
      throw new ConflictException(
        'This content was changed by someone else. Reload before pinning.',
      );
    }

    await this.cache.invalidate();

    this.logger.log(
      `Post ${dto.pinned ? 'pinned' : 'unpinned'}: "${updated.title}"`,
    );
    return toAdminDetail(updated);
  }
}
