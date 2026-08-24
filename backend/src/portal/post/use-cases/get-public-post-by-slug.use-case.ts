import { Injectable, NotFoundException } from '@nestjs/common';
import { PostType } from '../domain/enums/post-type.enum.js';
import { IPostRepository } from '../domain/interfaces/post-repository.interface.js';
import { PostDetailDto } from '../dto/response/post-detail.dto.js';
import { toPublicDetail } from '../infrastructure/mappers/post.mapper.js';

/**
 * Either the item, or where it moved to.
 *
 * A redirect is returned as data rather than thrown, because "this address has
 * moved" is a successful answer to the question and the controller is the layer
 * that knows how to say 301 in HTTP.
 */
export type PublicPostResult =
  { kind: 'found'; post: PostDetailDto } | { kind: 'moved'; slug: string };

@Injectable()
export class GetPublicPostBySlugUseCase {
  constructor(private readonly postRepository: IPostRepository) {}

  async execute(type: `${PostType}`, slug: string): Promise<PublicPostResult> {
    const post = await this.postRepository.findPublicBySlug(type, slug);
    if (post) {
      return { kind: 'found', post: toPublicDetail(post) };
    }

    // FR-066: an address this item used to answer to still works. A permanent
    // redirect rather than serving the content at both addresses, so search
    // engines consolidate on one and a shared WhatsApp link keeps working.
    const moved = await this.postRepository.findByHistoricalSlug(type, slug);
    if (moved) {
      return { kind: 'moved', slug: moved.currentSlug };
    }

    // One message for "never existed", "still a draft", "scheduled for
    // Tuesday", "archived", and "deleted". A visitor must not be able to tell
    // them apart, or the 404 becomes a way to enumerate unpublished work
    // (FR-022, FR-026).
    throw new NotFoundException('Page not found');
  }

  /** The detail payload, or a throw. For callers that cannot follow a redirect
   *  themselves — the metadata resolver and the related-posts anchor. */
  async executeOrThrow(
    type: `${PostType}`,
    slug: string,
  ): Promise<PostDetailDto> {
    const result = await this.execute(type, slug);
    if (result.kind === 'found') return result.post;

    // A moved address is not the item. Resolving it here would mean the caller
    // silently got metadata for a different URL than the one requested.
    throw new NotFoundException('Page not found');
  }
}
