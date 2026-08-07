import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { HtmlSanitizerService } from '../../../shared/helpers/html-sanitizer.service.js';
import { toSlug, toUniqueSlug } from '../../../shared/helpers/slug.helper.js';
import { PostType } from '../domain/enums/post-type.enum.js';
import { SyncMediaUsageUseCase } from '../../media/use-cases/sync-media-usage.use-case.js';
import { ITagRepository } from '../../taxonomy/domain/interfaces/tag-repository.interface.js';
import { IPostRepository } from '../domain/interfaces/post-repository.interface.js';
import { CreatePostDto } from '../dto/request/create-post.dto.js';
import { toAdminDetail } from '../infrastructure/mappers/post.mapper.js';

@Injectable()
export class CreatePostUseCase {
  private readonly logger = new Logger(CreatePostUseCase.name);

  constructor(
    private readonly postRepository: IPostRepository,
    private readonly sanitizer: HtmlSanitizerService,
    // Tags belong to the taxonomy module, so they are written through its port
    // rather than by touching portal_tags from here (Principle VI).
    private readonly tagRepository: ITagRepository,
    private readonly syncMediaUsage: SyncMediaUsageUseCase,
  ) {}

  async execute(dto: CreatePostDto, authorId: string) {
    assertTypeSpecificFields(dto);

    const slug = await this.resolveSlug(dto.type, dto.slug ?? dto.title);

    // DTO → Input field by field. Forwarding the whole object would compile,
    // which is how an unwanted field reaches persistence (Principle IV).
    const post = await this.postRepository.create({
      type: dto.type,
      title: dto.title,
      slug,
      summary: dto.summary,
      // Sanitize on write: the API is the trust boundary, not the editor.
      body: this.sanitizer.sanitize(dto.body),
      coverFileId: dto.coverFileId ?? null,
      coverAltText: dto.coverAltText ?? null,
      categoryId: dto.categoryId ?? null,
      metaTitle: dto.metaTitle ?? null,
      metaDescription: dto.metaDescription ?? null,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      attachmentFileId: dto.attachmentFileId ?? null,
      authorId,
    });

    if (dto.tags?.length) {
      const tags = await this.tagRepository.resolveOrCreate(dto.tags);
      await this.tagRepository.setPostTags(
        post.id,
        tags.map((tag) => tag.id),
      );
      post.tags = tags.map((tag) => ({ tag }));
    }

    // Runs after the write, on the body that was actually stored — the parser
    // reads the sanitized HTML, not the HTML that was sent (research R2).
    await this.syncMediaUsage.execute({
      column: 'postId',
      ownerId: post.id,
      body: post.body,
      coverFileId: post.coverFileId,
      attachmentFileId: post.attachmentFileId,
    });

    this.logger.log(`Post created as draft: ${dto.type} "${dto.title}"`);
    return toAdminDetail(post);
  }

  /** Probes existing slugs in the same content type and suffixes on collision. */
  private async resolveSlug(type: PostType, source: string): Promise<string> {
    const base = toSlug(source);
    if (base.length === 0) {
      throw new BadRequestException(
        'Judul tidak menghasilkan alamat yang valid. Gunakan minimal satu huruf atau angka.',
      );
    }
    const taken = await this.postRepository.findTakenSlugs(type, base);
    return toUniqueSlug(source, taken);
  }
}

/**
 * Expiry and attachment belong to Pengumuman. Silently ignoring them on a
 * Berita would leave an editor wondering why the date they set never applied.
 */
export function assertTypeSpecificFields(dto: {
  type: PostType;
  expiresAt?: string;
  attachmentFileId?: string;
}) {
  if (dto.type === PostType.PENGUMUMAN) return;
  if (dto.expiresAt || dto.attachmentFileId) {
    throw new BadRequestException(
      'expiresAt dan attachmentFileId hanya berlaku untuk Pengumuman.',
    );
  }
}
