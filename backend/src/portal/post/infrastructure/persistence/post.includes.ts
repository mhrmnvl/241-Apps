import { Prisma } from '@prisma/client';

/**
 * Pins the row shape once. Author identity comes through the profile when there
 * is one, so a deactivated author still renders a name rather than a blank
 * byline (FR-020).
 */
export const POST_INCLUDE = {
  author: {
    select: {
      id: true,
      identifier: true,
      profile: { select: { name: true } },
    },
  },
  category: { select: { id: true, name: true, slug: true } },
  coverFile: { select: { id: true, storageKey: true, mimeType: true } },
  attachment: { select: { id: true, storageKey: true, mimeType: true } },
  // Read here rather than through ITagRepository: a post's own labels come
  // back with the post in one query, and doing it per row would be an N+1 on
  // every listing. Writes still go through the taxonomy port — that module owns
  // the tag tables, and this module only ever reads its own row's relation.
  tags: {
    select: { tag: { select: { id: true, name: true, slug: true } } },
    orderBy: { tag: { name: 'asc' } },
  },
} satisfies Prisma.PostInclude;

export type PostRow = Prisma.PostGetPayload<{ include: typeof POST_INCLUDE }>;
