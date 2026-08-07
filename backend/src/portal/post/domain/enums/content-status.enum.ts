// Mirrors the Prisma ContentStatus enum. See post-type.enum.ts for why it is
// declared rather than re-exported.
//
// SCHEDULED is not "invisible" — an item is public once its publishedAt has
// passed, whatever its stored status says. See post.where.ts.
export enum ContentStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}
