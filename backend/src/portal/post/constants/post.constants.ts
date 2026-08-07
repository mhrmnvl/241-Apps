import { ContentStatus } from '../domain/enums/content-status.enum.js';
import { PostType } from '../domain/enums/post-type.enum.js';

/**
 * Public media addresses are stable and permanent by design. The signed,
 * expiring S3 URL stays behind this endpoint — a link-preview crawler or a
 * search index that caches an expiring URL is exactly the failure this avoids.
 */
export const PUBLIC_MEDIA_PATH = '/portal/public/media';

/** Fields that must be present before an item can go public (FR-012). */
export const REQUIRED_TO_PUBLISH = [
  'title',
  'summary',
  'body',
  'categoryId',
  'coverFileId',
] as const;

export const DEFAULT_PAGE_SIZE = 10;

/** "More like this" caps at four so the detail page keeps one tidy row (FR-025). */
export const RELATED_POST_LIMIT = 4;

/** How long a soft-deleted item can still be recovered (FR-019). */
export const RESTORE_WINDOW_DAYS = 30;

/** The `resource` value on every portal audit row (FR-064). */
export const AUDIT_RESOURCE = 'portal-post';

/**
 * The three actions that change what the public can see. Writing an audit row
 * for an ordinary edit would bury these under noise — the record exists to
 * answer "who put this on the school's website, and when".
 */
export const POST_AUDIT_ACTIONS = {
  PUBLISH: 'portal-post.publish',
  UNPUBLISH: 'portal-post.unpublish',
  DELETE: 'portal-post.delete',
} as const;

export type PostAuditAction =
  (typeof POST_AUDIT_ACTIONS)[keyof typeof POST_AUDIT_ACTIONS];

/**
 * Same values as the domain enums, typed as the string union the repository
 * ports use. Our enums and Prisma's are nominally distinct types, so ports
 * carry `${PostType}` to bridge them — and comparing a bridged value against
 * the enum directly is an unsafe-enum-comparison. These give both sides of
 * such a comparison one shared type.
 */
export const PENGUMUMAN_TYPE: `${PostType}` = PostType.PENGUMUMAN;
export const PUBLISHED_STATUS: `${ContentStatus}` = ContentStatus.PUBLISHED;

/**
 * The public address space, mapped to content types.
 *
 * Public URLs are lowercase (`/berita/…`) while the enum is not, so the segment
 * has to be translated rather than passed through. Handing the raw segment to
 * Prisma produces a validation error and a 500 — which, on a detail route, is
 * both a broken page and a leak of the fact that the address was *shaped* right.
 */
export const PUBLIC_PATH_TO_POST_TYPE: Record<string, `${PostType}`> = {
  berita: PostType.BERITA,
  artikel: PostType.ARTIKEL,
  pengumuman: PostType.PENGUMUMAN,
};

export const POST_TYPE_TO_PUBLIC_PATH: Record<`${PostType}`, string> = {
  [PostType.BERITA]: 'berita',
  [PostType.ARTIKEL]: 'artikel',
  [PostType.PENGUMUMAN]: 'pengumuman',
};

/**
 * Resolves a public URL segment to a content type, case-insensitively.
 *
 * Returns null for anything unrecognised, which the caller turns into the same
 * 404 an unknown slug gets — an address that names no content type is exactly
 * as absent as one that names no article.
 */
export function postTypeFromPath(segment: string): `${PostType}` | null {
  return PUBLIC_PATH_TO_POST_TYPE[segment.toLowerCase()] ?? null;
}
