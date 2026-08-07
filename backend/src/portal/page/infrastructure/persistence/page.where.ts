import { ContentStatus, Prisma } from '@prisma/client';

/**
 * A page is public under the same rule content is: not deleted, published or
 * scheduled, and its moment has passed.
 *
 * Restated here rather than imported from `post.where.ts` on purpose — the
 * types are different models, and reaching across module boundaries for a
 * Prisma filter is exactly the coupling Principle VI exists to prevent. The
 * *rule* is shared; the expression of it is per-model, and the two are asserted
 * to agree in `page.where.spec.ts`.
 *
 * Pages have no `scheduledAt` column — nobody schedules "Visi & Misi" — but
 * SCHEDULED is still admitted so the shape stays identical to the post
 * predicate rather than quietly diverging.
 */
export function visiblePageWhere(
  now: Date = new Date(),
): Prisma.PortalPageWhereInput {
  return {
    deletedAt: null,
    status: { in: [ContentStatus.SCHEDULED, ContentStatus.PUBLISHED] },
    publishedAt: { not: null, lte: now },
  };
}
