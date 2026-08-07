import { ContentStatus, Prisma } from '@prisma/client';

/**
 * The same visibility rule the rest of the portal uses, expressed for this
 * model. See `page.where.ts` for why the rule is shared but each expression of
 * it is per-model.
 */
export function visibleAlbumWhere(
  now: Date = new Date(),
): Prisma.GalleryAlbumWhereInput {
  return {
    deletedAt: null,
    status: { in: [ContentStatus.SCHEDULED, ContentStatus.PUBLISHED] },
    publishedAt: { not: null, lte: now },
  };
}
