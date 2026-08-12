import { Injectable, NotFoundException } from '@nestjs/common';
import { IPostRepository } from '../domain/interfaces/post-repository.interface.js';
import { PostDetailDto } from '../dto/response/post-detail.dto.js';
import { toPublicDetail } from '../infrastructure/mappers/post.mapper.js';

/**
 * Renders an item exactly as a visitor will see it, before it is public
 * (FR-011).
 *
 * The point is that it goes through `toPublicDetail` — the *same* mapper the
 * public detail endpoint uses. A preview built from the admin shape would drift
 * from the real page the moment either changed, and a preview that lies is
 * worse than none: an editor checks it, publishes, and finds the live page
 * different.
 *
 * Deliberately bypasses the visibility predicate, which is the one place in
 * this module that does. That is the whole feature — a draft has no public
 * address to look at — and it is safe because the route is behind
 * `portal-posts.read` rather than `@PortalPublic()`. It is also why this is its
 * own use case rather than a flag on `GetPublicPostBySlugUseCase`: a boolean
 * that switches the visibility check off is exactly the kind of parameter that
 * later gets passed from a query string.
 */
@Injectable()
export class PreviewPostUseCase {
  constructor(private readonly postRepository: IPostRepository) {}

  async execute(id: string): Promise<PostDetailDto> {
    const post = await this.postRepository.findById(id);

    // Soft-deleted items have no preview: restore first. Anything else — draft,
    // scheduled, archived — is precisely what an editor wants to look at.
    if (!post || post.deletedAt) {
      throw new NotFoundException(`Konten dengan ID ${id} not found`);
    }

    return {
      ...toPublicDetail(post),
      // The public mapper asserts publishedAt is non-null, which holds for
      // everything the visibility predicate returns but not for a draft. Fall
      // back to "now" so the preview shows the date it would carry if published
      // this instant, rather than an empty slot.
      publishedAt: post.publishedAt ?? new Date(),
    };
  }
}
