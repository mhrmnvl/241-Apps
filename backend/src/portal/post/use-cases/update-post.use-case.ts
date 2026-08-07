import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { HtmlSanitizerService } from '../../../shared/helpers/html-sanitizer.service.js';
import { PUBLISHED_STATUS } from '../constants/post.constants.js';
import { PostType } from '../domain/enums/post-type.enum.js';
import {
  IPostRepository,
  UpdatePostInput,
} from '../domain/interfaces/post-repository.interface.js';
import { SyncMediaUsageUseCase } from '../../media/use-cases/sync-media-usage.use-case.js';
import { ITagRepository } from '../../taxonomy/domain/interfaces/tag-repository.interface.js';
import { UpdatePostDto } from '../dto/request/update-post.dto.js';
import { toAdminDetail } from '../infrastructure/mappers/post.mapper.js';
import { assertTypeSpecificFields } from './create-post.use-case.js';
import { PortalCacheService } from '../../shared/services/portal-cache.service.js';

@Injectable()
export class UpdatePostUseCase {
  private readonly logger = new Logger(UpdatePostUseCase.name);

  constructor(
    private readonly postRepository: IPostRepository,
    private readonly sanitizer: HtmlSanitizerService,
    private readonly tagRepository: ITagRepository,
    private readonly syncMediaUsage: SyncMediaUsageUseCase,
    private readonly cache: PortalCacheService,
  ) {}

  async execute(id: string, dto: UpdatePostDto) {
    const existing = await this.postRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Konten dengan ID ${id} tidak ditemukan`);
    }

    assertTypeSpecificFields({
      type: existing.type as PostType,
      expiresAt: dto.expiresAt,
      attachmentFileId: dto.attachmentFileId,
    });

    const data: UpdatePostInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.summary !== undefined) data.summary = dto.summary;
    if (dto.body !== undefined) data.body = this.sanitizer.sanitize(dto.body);
    if (dto.coverFileId !== undefined) data.coverFileId = dto.coverFileId;
    if (dto.coverAltText !== undefined) data.coverAltText = dto.coverAltText;
    if (dto.categoryId !== undefined) data.categoryId = dto.categoryId;
    if (dto.metaTitle !== undefined) data.metaTitle = dto.metaTitle;
    if (dto.metaDescription !== undefined) {
      data.metaDescription = dto.metaDescription;
    }
    if (dto.expiresAt !== undefined) {
      data.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;
    }
    if (dto.attachmentFileId !== undefined) {
      data.attachmentFileId = dto.attachmentFileId;
    }

    // The slug is only ever changed explicitly. Retitling a published item must
    // not silently move its address — links are already out there (FR-008).
    const slugChanged = dto.slug !== undefined && dto.slug !== existing.slug;
    if (slugChanged) {
      data.slug = dto.slug;
    }

    // Blank SEO overrides are stored as null, so the read-time fallback to
    // title/summary engages. Keeping '' would publish an empty og:description,
    // which is exactly what an editor creates by clearing the field (FR-068).
    if (data.metaTitle !== undefined)
      data.metaTitle = blankToNull(data.metaTitle);
    if (data.metaDescription !== undefined) {
      data.metaDescription = blankToNull(data.metaDescription);
    }

    // publishedAt is deliberately absent from UpdatePostInput, so an edit
    // cannot move the original publication date (FR-018).
    const updated = await this.postRepository.update(id, dto.version, data);
    if (!updated) {
      throw new ConflictException(
        'Konten ini sudah diubah oleh pengguna lain. Muat ulang sebelum menyimpan.',
      );
    }

    // `undefined` leaves the tags alone; an empty array clears them. A partial
    // update that omitted `tags` must not silently strip an item's labels.
    if (dto.tags !== undefined) {
      const tags = await this.tagRepository.resolveOrCreate(dto.tags);
      await this.tagRepository.setPostTags(
        updated.id,
        tags.map((tag) => tag.id),
      );
      updated.tags = tags.map((tag) => ({ tag }));
    }

    // The old address is kept only for something that was already public.
    // Renaming a draft's slug moves an address nobody could have linked to, and
    // recording it would take that address out of circulation for good (FR-066).
    if (slugChanged && existing.publishedAt !== null) {
      await this.postRepository.recordSlugHistory(
        updated.id,
        updated.type,
        existing.slug,
      );
    }

    // Recomputed on every save, including saves that touched no media: an image
    // removed from the body leaves no event behind, so the only reliable answer
    // is to re-read what the stored content now references.
    await this.syncMediaUsage.execute({
      column: 'postId',
      ownerId: updated.id,
      body: updated.body,
      coverFileId: updated.coverFileId,
      attachmentFileId: updated.attachmentFileId,
    });

    // Only an edit of something already public can stale a cached page — an
    // edit to a draft changes nothing a visitor could have seen.
    if (updated.status === PUBLISHED_STATUS) {
      await this.cache.invalidate();
      this.logger.log(`Published post updated: "${updated.title}"`);
    }
    return toAdminDetail(updated);
  }
}

/** '' and '   ' both mean "no override" — only null triggers the fallback. */
function blankToNull(value: string | null): string | null {
  const trimmed = value?.trim();
  if (trimmed === undefined || trimmed.length === 0) return null;
  return trimmed;
}
