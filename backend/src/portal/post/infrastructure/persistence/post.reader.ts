import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';
import { PENGUMUMAN_TYPE } from '../../constants/post.constants.js';
import { PostType } from '../../domain/enums/post-type.enum.js';
import {
  PostQueryInput,
  PostWithDetails,
  PublicPostQueryInput,
  RelatedPostQueryInput,
} from '../../domain/interfaces/post-repository.interface.js';
import { POST_INCLUDE } from './post.includes.js';
import {
  activeAnnouncementWhere,
  buildAdminPostWhere,
  buildPublicPostWhere,
  PUBLIC_POST_ORDER_BY,
  relatedPostWhere,
  visiblePostWhere,
} from './post.where.js';

/**
 * The read queries, kept out of the repository class so that class stays a flat
 * contract-to-call map and stays inside the 200-line budget (Constitution V).
 *
 * Every function here composes a predicate from `post.where.ts` rather than
 * writing its own filter — a hand-rolled filter is how unpublished content
 * leaks, which is the one failure this module cannot afford.
 */

async function paginate(
  prisma: PrismaService,
  where: Prisma.PostWhereInput,
  orderBy: Prisma.PostOrderByWithRelationInput[],
  page: number,
  limit: number,
): Promise<PaginatedResult<PostWithDetails>> {
  const [data, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: POST_INCLUDE,
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
    }),
    prisma.post.count({ where }),
  ]);

  return { data, total, page, limit };
}

export function findAllPosts(
  prisma: PrismaService,
  query: PostQueryInput,
): Promise<PaginatedResult<PostWithDetails>> {
  const { page = 1, limit = 10 } = query;
  return paginate(
    prisma,
    buildAdminPostWhere(query),
    [{ updatedAt: 'desc' }],
    page,
    limit,
  );
}

export function findPublicPosts(
  prisma: PrismaService,
  query: PublicPostQueryInput,
  now: Date,
): Promise<PaginatedResult<PostWithDetails>> {
  const { page = 1, limit = 10 } = query;
  return paginate(
    prisma,
    buildPublicPostWhere(query, now),
    PUBLIC_POST_ORDER_BY,
    page,
    limit,
  );
}

export function findPublicPostBySlug(
  prisma: PrismaService,
  type: `${PostType}`,
  slug: string,
  now: Date,
): Promise<PostWithDetails | null> {
  // Detail deliberately ignores expiry: an expired announcement leaves the
  // active list but stays reachable at its own address (FR-044).
  return prisma.post.findFirst({
    where: { ...visiblePostWhere(now), type, slug },
    include: POST_INCLUDE,
  });
}

export function findLatestPublicPosts(
  prisma: PrismaService,
  type: `${PostType}`,
  take: number,
  now: Date,
): Promise<PostWithDetails[]> {
  const where =
    type === PENGUMUMAN_TYPE
      ? activeAnnouncementWhere(now)
      : { ...visiblePostWhere(now), type };

  return prisma.post.findMany({
    where,
    include: POST_INCLUDE,
    take,
    orderBy: PUBLIC_POST_ORDER_BY,
  });
}

/**
 * Two passes rather than one clever ORDER BY: same category first, then
 * recency for the remainder (FR-025). Written this way because "same category
 * ranks above everything else" is a rule a reader can check, whereas the
 * equivalent CASE expression is a rule only the database can.
 */
export async function findRelatedPosts(
  prisma: PrismaService,
  query: RelatedPostQueryInput,
  now: Date,
): Promise<PostWithDetails[]> {
  const batch = (where: Prisma.PostWhereInput, take: number) =>
    take <= 0
      ? Promise.resolve([])
      : prisma.post.findMany({
          where,
          include: POST_INCLUDE,
          take,
          orderBy: [{ publishedAt: 'desc' }],
        });

  const picked = query.categoryId
    ? await batch(relatedPostWhere(query, [query.excludeId], now), query.take)
    : [];
  if (picked.length >= query.take) return picked;

  const excludeIds = [query.excludeId, ...picked.map((post) => post.id)];
  const fill = await batch(
    relatedPostWhere(query, excludeIds, now, false),
    query.take - picked.length,
  );

  return [...picked, ...fill];
}

/** An address a post used to answer to, and where it points now (FR-066). */
export async function findPostByHistoricalSlug(
  prisma: PrismaService,
  type: `${PostType}`,
  slug: string,
): Promise<{ postId: string; currentSlug: string } | null> {
  const row = await prisma.postSlugHistory.findFirst({
    where: { type, slug },
    select: { postId: true, post: { select: { slug: true } } },
  });
  return row ? { postId: row.postId, currentSlug: row.post.slug } : null;
}

/**
 * Every visible item, for the sitemap (FR-067).
 *
 * Composes the same predicate the public listings do, so the sitemap cannot
 * name something a visitor is unable to open — which would hand a crawler a map
 * of unpublished work.
 */
export async function findVisiblePostsForSitemap(
  prisma: PrismaService,
  now: Date,
): Promise<
  { type: `${PostType}`; slug: string; publishedAt: Date; updatedAt: Date }[]
> {
  const rows = await prisma.post.findMany({
    where: visiblePostWhere(now),
    select: { type: true, slug: true, publishedAt: true, updatedAt: true },
    orderBy: { publishedAt: 'desc' },
  });
  // publishedAt is non-null by construction — the predicate requires it.
  return rows.map((row) => ({ ...row, publishedAt: row.publishedAt! }));
}

/** Slugs already taken within a content type, so the use case can suffix. */
export async function findTakenPostSlugs(
  prisma: PrismaService,
  type: `${PostType}`,
  prefix: string,
): Promise<string[]> {
  const rows = await prisma.post.findMany({
    where: { type, slug: { startsWith: prefix } },
    select: { slug: true },
  });
  return rows.map((row) => row.slug);
}
