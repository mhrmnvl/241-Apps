import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { IPostRepository } from '../domain/interfaces/post-repository.interface.js';
import { PostVersionDto } from '../dto/request/post-version.dto.js';
import { toAdminDetail } from '../infrastructure/mappers/post.mapper.js';
import { PortalCacheService } from '../../shared/services/portal-cache.service.js';

/**
 * Files an item away (FR-016).
 *
 * `publishedAt` is retained on purpose. Archiving is not retraction: the item
 * did go out on that date, and the record of when should survive being taken
 * off the site. Visibility still ends immediately, because the predicate
 * requires status to be SCHEDULED or PUBLISHED.
 *
 * No audit row: FR-064 names publish, unpublish, and delete. Archiving is an
 * editorial tidy-up, and recording it would bury the three that matter.
 */
@Injectable()
export class ArchivePostUseCase {
  private readonly logger = new Logger(ArchivePostUseCase.name);

  constructor(
    private readonly postRepository: IPostRepository,
    private readonly cache: PortalCacheService,
  ) {}

  async execute(id: string, dto: PostVersionDto) {
    const existing = await this.postRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Konten dengan ID ${id} tidak ditemukan`);
    }

    const updated = await this.postRepository.archive(id, dto.version);
    if (!updated) {
      throw new ConflictException(
        'Konten ini sudah diubah oleh pengguna lain. Muat ulang sebelum mengarsipkan.',
      );
    }

    await this.cache.invalidate();

    this.logger.log(`Post archived: "${updated.title}"`);
    return toAdminDetail(updated);
  }
}
