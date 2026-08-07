import { ContentStatus, Prisma } from '@prisma/client';
import { PostType } from '../../domain/enums/post-type.enum.js';
import { PENGUMUMAN_TYPE } from '../../constants/post.constants.js';
import {
  PostQueryInput,
  PublicPostQueryInput,
  RelatedPostQueryInput,
} from '../../domain/interfaces/post-repository.interface.js';

/**
 * The one definition of "a visitor can see this".
 *
 * Visibility is derived from the publication timestamp, never from a stored
 * flag, so an item goes public the moment its own publishedAt passes — whether
 * or not the status-normalising cron has run. That cron only relabels
 * SCHEDULED as PUBLISHED for the management list; nothing public depends on it.
 *
 * SCHEDULED is therefore included on purpose. A scheduled item whose moment has
 * NOT arrived is still excluded, by the publishedAt comparison rather than by
 * its status.
 *
 * Every public query composes this. A hand-rolled filter somewhere else is a
 * silent leak of unpublished content, which is exactly what the SC-004 sweep
 * exists to catch.
 */
export function visiblePostWhere(
  now: Date = new Date(),
): Prisma.PostWhereInput {
  return {
    deletedAt: null,
    status: { in: [ContentStatus.SCHEDULED, ContentStatus.PUBLISHED] },
    publishedAt: { not: null, lte: now },
  };
}

/**
 * Rows the normalizing cron relabels: SCHEDULED, still present, and past due.
 *
 * Cosmetic by construction — `visiblePostWhere` already treats these as public,
 * so the relabelling changes what the management list *says*, never what a
 * visitor can see. If the cron never runs, nothing public is wrong.
 */
export function dueScheduledWhere(
  now: Date = new Date(),
): Prisma.PostWhereInput {
  return {
    deletedAt: null,
    status: ContentStatus.SCHEDULED,
    publishedAt: { not: null, lte: now },
  };
}

/**
 * Announcements drop out of the "active" view once they expire, but stay
 * reachable at their own address — so expiry is a *list* concern, not a
 * visibility one, and lives here rather than inside `visiblePostWhere`.
 *
 * That distinction is the whole of FR-044: a notice about a deadline that has
 * passed should stop crowding the current notices, without breaking the link
 * someone sent to it last week.
 */
export function activeAnnouncementWhere(
  now: Date = new Date(),
): Prisma.PostWhereInput {
  return {
    ...visiblePostWhere(now),
    type: PostType.PENGUMUMAN,
    OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
  };
}

/** The complement: announcements whose moment has been and gone. */
export function expiredAnnouncementWhere(
  now: Date = new Date(),
): Prisma.PostWhereInput {
  return {
    ...visiblePostWhere(now),
    type: PostType.PENGUMUMAN,
    expiresAt: { not: null, lte: now },
  };
}

/** Public listing for one content type, newest first with pinned items leading. */
export function publicPostListWhere(
  type: PostType,
  now: Date = new Date(),
): Prisma.PostWhereInput {
  return { ...visiblePostWhere(now), type };
}

/** Ordering shared by the public listings and the homepage sections: pinned
 *  items lead, everything else falls back to recency. */
export const PUBLIC_POST_ORDER_BY: Prisma.PostOrderByWithRelationInput[] = [
  { pinnedAt: { sort: 'desc', nulls: 'last' } },
  { publishedAt: 'desc' },
];

/**
 * The public listing filter. Built on publicPostListWhere so the visibility
 * rule is inherited rather than restated — a caller can narrow this with
 * category or search, never widen it past what a visitor may see.
 */
export function buildPublicPostWhere(
  query: PublicPostQueryInput,
  now: Date = new Date(),
): Prisma.PostWhereInput {
  const { type, categorySlug, tagSlug, search, expiryScope } = query;

  // Expiry applies to announcements and nothing else. `scope` on a Berita
  // listing is silently ignored rather than rejected — a query string that
  // means nothing for that type is not an error the visitor can act on.
  const base =
    type === PENGUMUMAN_TYPE
      ? expiryScope === 'archive'
        ? expiredAnnouncementWhere(now)
        : activeAnnouncementWhere(now)
      : publicPostListWhere(type as PostType, now);

  return {
    ...base,
    ...(categorySlug && { category: { slug: categorySlug, isActive: true } }),
    // A tag has no active flag — it is a label, and a label that exists is one
    // a visitor may filter by.
    ...(tagSlug && { tags: { some: { tag: { slug: tagSlug } } } }),
    ...(search && {
      AND: [
        {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { summary: { contains: search, mode: 'insensitive' } },
          ],
        },
      ],
    }),
  };
}

/**
 * "More like this" (FR-025), in two passes rather than one clever ORDER BY.
 *
 * `excludeIds` always carries the item being read, plus anything an earlier
 * pass already picked, so the two passes cannot return the same row twice.
 * `categoryId` narrows to the first pass; omitting it is the recency fallback
 * that fills the remainder.
 */
export function relatedPostWhere(
  query: Pick<RelatedPostQueryInput, 'type' | 'categoryId'>,
  excludeIds: string[],
  now: Date = new Date(),
  sameCategoryOnly = true,
): Prisma.PostWhereInput {
  return {
    ...publicPostListWhere(query.type as PostType, now),
    id: { notIn: excludeIds },
    ...(sameCategoryOnly && query.categoryId
      ? { categoryId: query.categoryId }
      : {}),
  };
}

/**
 * The management listing filter. Unlike the public one this may show every
 * lifecycle state — it is only ever reached behind a permission check — but it
 * still hides soft-deleted rows unless the caller is looking at the bin.
 */
export function buildAdminPostWhere(
  query: PostQueryInput,
): Prisma.PostWhereInput {
  const { type, status, categoryId, search, includeDeleted } = query;

  return {
    ...(includeDeleted ? { deletedAt: { not: null } } : { deletedAt: null }),
    ...(type && { type }),
    ...(status && { status }),
    ...(categoryId && { categoryId }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };
}
