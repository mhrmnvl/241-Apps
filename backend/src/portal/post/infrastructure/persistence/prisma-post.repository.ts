import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';
import { PostType } from '../../domain/enums/post-type.enum.js';
import {
  CreatePostInput,
  IPostRepository,
  PostQueryInput,
  PostWithDetails,
  PublicPostQueryInput,
  PublishPostInput,
  RelatedPostQueryInput,
  UpdatePostInput,
} from '../../domain/interfaces/post-repository.interface.js';
import { updateIfVersionMatches } from '../../../shared/persistence/optimistic-update.js';
import { POST_INCLUDE } from './post.includes.js';
import {
  findAllPosts,
  findLatestPublicPosts,
  findPostByHistoricalSlug,
  findPublicPostBySlug,
  findPublicPosts,
  findRelatedPosts,
  findTakenPostSlugs,
  findVisiblePostsForSitemap,
} from './post.reader.js';
import {
  buildArchiveData,
  buildCreateData,
  buildPinData,
  buildPublishData,
  buildUnpublishData,
  buildUpdateData,
  normalizeDueScheduledPosts,
  recordPostSlugHistory,
  restorePost,
  softDeletePost,
} from './post.writer.js';

/**
 * A flat contract-to-call map. Query construction lives in `post.where.ts`,
 * read composition in `post.reader.ts`, and write payloads in `post.writer.ts`,
 * so this class answers only "which call serves which contract method".
 */
@Injectable()
export class PrismaPostRepository extends IPostRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(
    query: PostQueryInput,
  ): Promise<PaginatedResult<PostWithDetails>> {
    return findAllPosts(this.prisma, query);
  }

  async findById(id: string): Promise<PostWithDetails | null> {
    return this.prisma.post.findFirst({ where: { id }, include: POST_INCLUDE });
  }

  async findPublic(
    query: PublicPostQueryInput,
    now: Date = new Date(),
  ): Promise<PaginatedResult<PostWithDetails>> {
    return findPublicPosts(this.prisma, query, now);
  }

  async findPublicBySlug(
    type: `${PostType}`,
    slug: string,
    now: Date = new Date(),
  ): Promise<PostWithDetails | null> {
    return findPublicPostBySlug(this.prisma, type, slug, now);
  }

  async findLatestPublic(
    type: `${PostType}`,
    take: number,
    now: Date = new Date(),
  ): Promise<PostWithDetails[]> {
    return findLatestPublicPosts(this.prisma, type, take, now);
  }

  async findRelated(
    query: RelatedPostQueryInput,
    now: Date = new Date(),
  ): Promise<PostWithDetails[]> {
    return findRelatedPosts(this.prisma, query, now);
  }

  async findTakenSlugs(type: `${PostType}`, prefix: string): Promise<string[]> {
    return findTakenPostSlugs(this.prisma, type, prefix);
  }

  async findByHistoricalSlug(type: `${PostType}`, slug: string) {
    return findPostByHistoricalSlug(this.prisma, type, slug);
  }

  async recordSlugHistory(
    postId: string,
    type: `${PostType}`,
    slug: string,
  ): Promise<void> {
    return recordPostSlugHistory(this.prisma, postId, type, slug);
  }

  async findAllVisibleForSitemap(now: Date = new Date()) {
    return findVisiblePostsForSitemap(this.prisma, now);
  }

  async create(data: CreatePostInput): Promise<PostWithDetails> {
    return this.prisma.post.create({
      data: buildCreateData(data),
      include: POST_INCLUDE,
    });
  }

  async update(
    id: string,
    expectedVersion: number,
    data: UpdatePostInput,
  ): Promise<PostWithDetails | null> {
    return this.updateIfVersionMatches(
      id,
      expectedVersion,
      buildUpdateData(data),
    );
  }

  async publish(
    id: string,
    expectedVersion: number,
    data: PublishPostInput,
  ): Promise<PostWithDetails | null> {
    return this.updateIfVersionMatches(
      id,
      expectedVersion,
      buildPublishData(data),
    );
  }

  async unpublish(
    id: string,
    expectedVersion: number,
  ): Promise<PostWithDetails | null> {
    return this.updateIfVersionMatches(
      id,
      expectedVersion,
      buildUnpublishData(),
    );
  }

  async archive(
    id: string,
    expectedVersion: number,
  ): Promise<PostWithDetails | null> {
    return this.updateIfVersionMatches(id, expectedVersion, buildArchiveData());
  }

  async pin(
    id: string,
    expectedVersion: number,
    pinnedAt: Date | null,
  ): Promise<PostWithDetails | null> {
    return this.updateIfVersionMatches(
      id,
      expectedVersion,
      buildPinData(pinnedAt),
    );
  }

  async softDelete(id: string) {
    return softDeletePost(this.prisma, id);
  }

  async restore(id: string): Promise<PostWithDetails> {
    return restorePost(this.prisma, id);
  }

  /** Cosmetic relabelling for the management list — see PostStatusSyncService. */
  async normalizeDueScheduled(now: Date = new Date()): Promise<number> {
    return normalizeDueScheduledPosts(this.prisma, now);
  }

  private updateIfVersionMatches(
    id: string,
    expectedVersion: number,
    data: Prisma.PostUncheckedUpdateInput,
  ): Promise<PostWithDetails | null> {
    return updateIfVersionMatches(
      () =>
        this.prisma.post.updateMany({
          where: { id, version: expectedVersion, deletedAt: null },
          data,
        }),
      () =>
        this.prisma.post.findFirstOrThrow({
          where: { id },
          include: POST_INCLUDE,
        }),
    );
  }
}
