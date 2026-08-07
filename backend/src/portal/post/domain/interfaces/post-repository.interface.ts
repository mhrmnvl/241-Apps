import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';
import { ContentStatus } from '../enums/content-status.enum.js';
import { PostType } from '../enums/post-type.enum.js';
import { PostEntity, PostWithDetails } from '../entities/post.entity.js';

export type { PostWithDetails };

/**
 * Repository port. These are `*Input` shapes — plain interfaces, no
 * class-validator, no Swagger. A DTO must never reach here; the use case maps
 * DTO → Input field by field so an unwanted field cannot ride along.
 */
export interface CreatePostInput {
  type: `${PostType}`;
  title: string;
  slug: string;
  summary: string;
  body: string;
  coverFileId?: string | null;
  coverAltText?: string | null;
  categoryId?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  expiresAt?: Date | null;
  attachmentFileId?: string | null;
  authorId: string;
}

export interface UpdatePostInput {
  title?: string;
  slug?: string;
  summary?: string;
  body?: string;
  coverFileId?: string | null;
  coverAltText?: string | null;
  categoryId?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  expiresAt?: Date | null;
  attachmentFileId?: string | null;
}

/** Publishing sets both at once: SCHEDULED with a future moment, PUBLISHED with
 *  a past one. Visibility is derived from `publishedAt`, so the status is a
 *  label and the timestamp is the truth. */
export interface PublishPostInput {
  status: `${ContentStatus}`;
  publishedAt: Date;
  scheduledAt: Date | null;
}

export interface PostQueryInput {
  page?: number;
  limit?: number;
  type?: `${PostType}`;
  status?: `${ContentStatus}`;
  categoryId?: string;
  search?: string;
  includeDeleted?: boolean;
}

export interface PublicPostQueryInput {
  page?: number;
  limit?: number;
  type: `${PostType}`;
  categorySlug?: string;
  tagSlug?: string;
  search?: string;
  /**
   * Announcements only. `active` (the default) hides expired notices; `archive`
   * shows only those. Ignored for other types, which have no expiry (FR-044).
   */
  expiryScope?: 'active' | 'archive';
}

/** "More like this" at the foot of a detail page (FR-025). */
export interface RelatedPostQueryInput {
  type: `${PostType}`;
  /** The item being read — never one of its own related items. */
  excludeId: string;
  categoryId: string | null;
  take: number;
}

export abstract class IPostRepository {
  abstract findAll(
    query: PostQueryInput,
  ): Promise<PaginatedResult<PostWithDetails>>;

  abstract findById(id: string): Promise<PostWithDetails | null>;

  /** Public reads. Every one of these composes the visibility predicate; a
   *  caller can never widen it by passing a flag. */
  abstract findPublic(
    query: PublicPostQueryInput,
    now?: Date,
  ): Promise<PaginatedResult<PostWithDetails>>;

  abstract findPublicBySlug(
    type: `${PostType}`,
    slug: string,
    now?: Date,
  ): Promise<PostWithDetails | null>;

  abstract findLatestPublic(
    type: `${PostType}`,
    take: number,
    now?: Date,
  ): Promise<PostWithDetails[]>;

  /** Same category first, then recency — see the use case for why the fill is
   *  a second query rather than one clever ORDER BY. */
  abstract findRelated(
    query: RelatedPostQueryInput,
    now?: Date,
  ): Promise<PostWithDetails[]>;

  /** Slugs already taken within a content type, so the use case can suffix. */
  abstract findTakenSlugs(
    type: `${PostType}`,
    prefix: string,
  ): Promise<string[]>;

  /**
   * An address a post used to answer to. A public detail request that misses on
   * the live slug falls back here and redirects, so links already shared on
   * WhatsApp or indexed by a search engine keep working (FR-066).
   */
  abstract findByHistoricalSlug(
    type: `${PostType}`,
    slug: string,
  ): Promise<{ postId: string; currentSlug: string } | null>;

  /** Idempotent: re-recording an address already in history is a no-op. */
  abstract recordSlugHistory(
    postId: string,
    type: `${PostType}`,
    slug: string,
  ): Promise<void>;

  /** Every publicly visible item, for the sitemap (FR-067). */
  abstract findAllVisibleForSitemap(
    now?: Date,
  ): Promise<
    { type: `${PostType}`; slug: string; publishedAt: Date; updatedAt: Date }[]
  >;

  abstract create(data: CreatePostInput): Promise<PostWithDetails>;

  /**
   * Optimistic lock: matches on `expectedVersion` and increments. Returns null
   * when no row matched, which the use case turns into a 409 rather than
   * silently discarding the other editor's work.
   */
  abstract update(
    id: string,
    expectedVersion: number,
    data: UpdatePostInput,
  ): Promise<PostWithDetails | null>;

  abstract publish(
    id: string,
    expectedVersion: number,
    data: PublishPostInput,
  ): Promise<PostWithDetails | null>;

  /** Back to DRAFT with `publishedAt` cleared — a republish is a new publication. */
  abstract unpublish(
    id: string,
    expectedVersion: number,
  ): Promise<PostWithDetails | null>;

  /** Off the site but on the record: `publishedAt` is retained. */
  abstract archive(
    id: string,
    expectedVersion: number,
  ): Promise<PostWithDetails | null>;

  abstract pin(
    id: string,
    expectedVersion: number,
    pinnedAt: Date | null,
  ): Promise<PostWithDetails | null>;

  abstract softDelete(id: string): Promise<PostEntity>;

  abstract restore(id: string): Promise<PostWithDetails>;

  /**
   * Relabels SCHEDULED rows whose moment has passed. Returns how many.
   * Cosmetic — see PostStatusSyncService and `dueScheduledWhere`.
   */
  abstract normalizeDueScheduled(now?: Date): Promise<number>;
}
