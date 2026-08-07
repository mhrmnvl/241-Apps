import { ContentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { PostType } from '../../domain/enums/post-type.enum.js';
import { dueScheduledWhere } from './post.where.js';
import { POST_INCLUDE } from './post.includes.js';
import {
  CreatePostInput,
  PublishPostInput,
  UpdatePostInput,
} from '../../domain/interfaces/post-repository.interface.js';

/**
 * Input → Prisma payload. Kept out of the repository class so the class stays a
 * flat contract-to-call map, and so "which fields can be written" is answerable
 * by reading one short file.
 */
export function buildCreateData(
  input: CreatePostInput,
): Prisma.PostUncheckedCreateInput {
  return {
    type: input.type,
    title: input.title,
    slug: input.slug,
    summary: input.summary,
    body: input.body,
    coverFileId: input.coverFileId ?? null,
    coverAltText: input.coverAltText ?? null,
    categoryId: input.categoryId ?? null,
    metaTitle: input.metaTitle ?? null,
    metaDescription: input.metaDescription ?? null,
    expiresAt: input.expiresAt ?? null,
    attachmentFileId: input.attachmentFileId ?? null,
    authorId: input.authorId,
  };
}

/**
 * Only keys actually present are written, so a partial update cannot blank a
 * field the editor never touched. `version` increments here — that increment
 * paired with the `expectedVersion` match is the whole optimistic lock.
 */
export function buildUpdateData(
  input: UpdatePostInput,
): Prisma.PostUncheckedUpdateInput {
  const data: Prisma.PostUncheckedUpdateInput = { version: { increment: 1 } };

  if (input.title !== undefined) data.title = input.title;
  if (input.slug !== undefined) data.slug = input.slug;
  if (input.summary !== undefined) data.summary = input.summary;
  if (input.body !== undefined) data.body = input.body;
  if (input.coverFileId !== undefined) data.coverFileId = input.coverFileId;
  if (input.coverAltText !== undefined) data.coverAltText = input.coverAltText;
  if (input.categoryId !== undefined) data.categoryId = input.categoryId;
  if (input.metaTitle !== undefined) data.metaTitle = input.metaTitle;
  if (input.metaDescription !== undefined) {
    data.metaDescription = input.metaDescription;
  }
  if (input.expiresAt !== undefined) data.expiresAt = input.expiresAt;
  if (input.attachmentFileId !== undefined) {
    data.attachmentFileId = input.attachmentFileId;
  }

  return data;
}

export function buildPublishData(
  input: PublishPostInput,
): Prisma.PostUncheckedUpdateInput {
  return {
    status: input.status,
    publishedAt: input.publishedAt,
    scheduledAt: input.scheduledAt,
    version: { increment: 1 },
  };
}

/**
 * Unpublishing clears `publishedAt`, so a later republish is a fresh
 * publication rather than a resurrection of the old date (FR-017). The pending
 * schedule goes too — otherwise a withdrawn item would quietly reappear at the
 * moment it was originally due.
 */
export function buildUnpublishData(): Prisma.PostUncheckedUpdateInput {
  return {
    status: ContentStatus.DRAFT,
    publishedAt: null,
    scheduledAt: null,
    version: { increment: 1 },
  };
}

/**
 * Archiving keeps `publishedAt`, because archiving is filing rather than
 * retraction: the item did go out on that date, and the record of when should
 * survive being taken off the site.
 */
export function buildArchiveData(): Prisma.PostUncheckedUpdateInput {
  return { status: ContentStatus.ARCHIVED, version: { increment: 1 } };
}

export function buildPinData(
  pinnedAt: Date | null,
): Prisma.PostUncheckedUpdateInput {
  return { pinnedAt, version: { increment: 1 } };
}

/**
 * Records an address a post used to answer to (FR-066).
 *
 * `upsert` on the (type, slug) unique key, so re-recording an address the post
 * already released is a no-op rather than a crash on a slug that gets reused.
 */
export async function recordPostSlugHistory(
  prisma: PrismaService,
  postId: string,
  type: `${PostType}`,
  slug: string,
): Promise<void> {
  await prisma.postSlugHistory.upsert({
    where: { type_slug: { type, slug } },
    update: { postId },
    create: { postId, type, slug },
  });
}

/** Cosmetic relabelling for the management list — see PostStatusSyncService. */
export async function normalizeDueScheduledPosts(
  prisma: PrismaService,
  now: Date,
): Promise<number> {
  const { count } = await prisma.post.updateMany({
    where: dueScheduledWhere(now),
    data: { status: ContentStatus.PUBLISHED },
  });
  return count;
}

/** Soft delete leaves `status` alone, which is what lets a restore return the
 *  item to exactly the state it was in rather than to a guess (FR-019). */
export function softDeletePost(prisma: PrismaService, id: string) {
  return prisma.post.update({ where: { id }, data: { deletedAt: new Date() } });
}

export function restorePost(prisma: PrismaService, id: string) {
  return prisma.post.update({
    where: { id },
    data: { deletedAt: null },
    include: POST_INCLUDE,
  });
}
