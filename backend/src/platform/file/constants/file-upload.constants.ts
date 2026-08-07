export const ALLOWED_UPLOAD_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
] as const;

/** Human-readable form of the list above, for the rejection message (FR-056). */
export const ACCEPTED_UPLOAD_FORMATS_LABEL = 'JPG, PNG, WebP, GIF, PDF';

// GIF is excluded: sharp only reads the first frame unless given {animated:
// true}, which would silently flatten any animated GIF during optimization.
export const OPTIMIZABLE_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const IMAGE_OPTIMIZATION_OPTIONS = {
  maxWidth: 2000,
  maxHeight: 2000,
  quality: 80,
} as const;

/**
 * The share-preview variant, generated alongside the original at upload time.
 *
 * Three decisions, each of them load-bearing for link previews:
 *
 * - **1200×630, cropped rather than fitted.** This is the ratio the major
 *   platforms crop to. Supplying it directly stops their arbitrary crop cutting
 *   heads off a school group photo — which is most of what this portal
 *   publishes.
 * - **JPEG, not WebP.** WebP support across link-preview crawlers is
 *   inconsistent, and this is the one image where compatibility matters more
 *   than file size. Everywhere else the pipeline stays on WebP.
 * - **quality 72.** The main optimizer's 2000×2000 at quality 80 leaves a
 *   several-hundred-kilobyte file for a typical event photo, and preview
 *   crawlers — WhatsApp in particular — render a card with *no image* rather
 *   than fetch a large one. That failure looks like a code bug and is not one:
 *   it is intermittent, depends on the photo, and nothing in the logs mentions
 *   it. Keeping this variant small is what makes previews reliable.
 */
export const SHARE_PREVIEW_OPTIONS = {
  width: 1200,
  height: 630,
  quality: 72,
} as const;

/** Suffix appended to the original's storage key to derive the variant's. */
export const SHARE_PREVIEW_SUFFIX = '.preview.jpg';

/**
 * Where the share-preview variant of a stored object lives.
 *
 * Derived rather than recorded, so there is no second column to keep in step
 * and no migration for files uploaded before the variant existed — for those
 * the key simply resolves to an object that is not there, and the caller falls
 * back to the original.
 */
export function sharePreviewKey(storageKey: string): string {
  return `${storageKey}${SHARE_PREVIEW_SUFFIX}`;
}
