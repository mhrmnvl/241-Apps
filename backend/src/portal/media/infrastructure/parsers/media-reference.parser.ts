import { PUBLIC_MEDIA_PATH } from '../../../post/constants/post.constants.js';

/**
 * Every portal image is rendered through the stable public media address, never
 * a signed URL — that is the rule research R2 exists to enforce, and it is what
 * makes the body parseable at all.
 *
 * Matching the path rather than parsing HTML is deliberate. An HTML parser
 * would find `<img src>` and miss a file referenced from a `<a href>` download
 * link or a `srcset`; this finds every reference regardless of where it sits,
 * and a false positive costs one extra usage row rather than a broken image.
 */
const MEDIA_REFERENCE = new RegExp(
  `${PUBLIC_MEDIA_PATH.replace(/\//g, '\\/')}\\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})`,
  'g',
);

/** File ids referenced anywhere in the given HTML, de-duplicated. */
export function extractMediaIds(html: string): string[] {
  if (!html) return [];

  const ids = new Set<string>();
  for (const match of html.matchAll(MEDIA_REFERENCE)) {
    ids.add(match[1].toLowerCase());
  }
  return [...ids];
}
