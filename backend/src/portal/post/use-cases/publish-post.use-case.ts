import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ContentStatus } from '../domain/enums/content-status.enum.js';
import {
  IPostRepository,
  PostWithDetails,
} from '../domain/interfaces/post-repository.interface.js';
import { PublishPostDto } from '../dto/request/publish-post.dto.js';
import { toAdminDetail } from '../infrastructure/mappers/post.mapper.js';
import {
  POST_AUDIT_ACTIONS,
  REQUIRED_TO_PUBLISH,
} from '../constants/post.constants.js';
import { PostAuditService } from '../services/post-audit.service.js';
import { PortalCacheService } from '../../shared/services/portal-cache.service.js';

@Injectable()
export class PublishPostUseCase {
  private readonly logger = new Logger(PublishPostUseCase.name);

  constructor(
    private readonly postRepository: IPostRepository,
    private readonly audit: PostAuditService,
    private readonly cache: PortalCacheService,
  ) {}

  async execute(
    id: string,
    dto: PublishPostDto,
    actorId: string | null = null,
  ) {
    const existing = await this.postRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Konten dengan ID ${id} not found`);
    }

    assertReadyToPublish(existing);

    const now = new Date();
    const scheduledAt = dto.scheduledAt ? new Date(dto.scheduledAt) : null;

    if (scheduledAt && scheduledAt.getTime() <= now.getTime()) {
      throw new BadRequestException(
        'The scheduled publish time must be in the future. Leave it empty to publish now.',
      );
    }

    // publishedAt carries the truth either way: with a future schedule the row
    // is SCHEDULED and becomes public exactly when that moment passes, without
    // anything needing to run. The status is a label for the admin list.
    const published = await this.postRepository.publish(id, dto.version, {
      status: scheduledAt ? ContentStatus.SCHEDULED : ContentStatus.PUBLISHED,
      publishedAt: scheduledAt ?? now,
      scheduledAt,
    });

    if (!published) {
      throw new ConflictException(
        'This content was changed by someone else. Reload before publishing.',
      );
    }

    // Recorded for a schedule too: the decision to put this on the school's
    // website was taken now, by this person, whichever moment it goes out.
    await this.audit.record(POST_AUDIT_ACTIONS.PUBLISH, published, actorId);
    await this.cache.invalidate();

    this.logger.log(
      scheduledAt
        ? `Post scheduled for ${scheduledAt.toISOString()}: "${published.title}"`
        : `Post published: "${published.title}"`,
    );
    return toAdminDetail(published);
  }
}

/**
 * Draft saves skip every one of these — half-finished work is the point of a
 * draft. They apply only at the moment something becomes public (FR-012).
 */
function assertReadyToPublish(post: PostWithDetails) {
  const missing = REQUIRED_TO_PUBLISH.filter((field) => {
    const value = post[field];
    return value === null || value === undefined || value === '';
  });

  if (missing.length > 0) {
    throw new UnprocessableEntityException({
      message: 'The content is not complete enough to publish',
      missingFields: missing,
    });
  }

  if (post.coverFileId && !post.coverAltText?.trim()) {
    throw new UnprocessableEntityException({
      message: 'Cover image alt text is required before publishing',
      missingFields: ['coverAltText'],
    });
  }
}
