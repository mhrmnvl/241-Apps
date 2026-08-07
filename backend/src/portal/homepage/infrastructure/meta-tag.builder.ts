import { PageMetaDto } from '../dto/response/page-meta.dto.js';
import { PORTAL_DEFAULT_META } from '../constants/meta.constants.js';

export const META_BLOCK_START = '<!-- speckit:meta:start -->';
export const META_BLOCK_END = '<!-- speckit:meta:end -->';

const SITE_NAME = 'MTs Persis 241 Al-Ikhlash';

/**
 * Escapes for an HTML *attribute value*.
 *
 * Load-bearing: `content="…"` carries an article title an editor typed. A title
 * containing a quote would otherwise close the attribute and let the rest of it
 * be parsed as markup — an injection whose source is the CMS's own content,
 * which no amount of sanitizing the article body would catch.
 */
function attr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function tag(kind: 'property' | 'name', key: string, value: string): string {
  return `<meta ${kind}="${key}" content="${attr(value)}" />`;
}

/** The tags for one resolved path. Order matches the placeholder block's. */
export function buildMetaTags(meta: PageMetaDto | null): string {
  const resolved = meta ?? {
    ...PORTAL_DEFAULT_META,
    canonicalUrl: '',
    imageUrl: null,
    type: 'website' as const,
    publishedAt: null,
  };

  const tags = [
    `<title>${attr(resolved.title)}</title>`,
    tag('name', 'description', resolved.description),
    tag('property', 'og:site_name', SITE_NAME),
    tag('property', 'og:title', resolved.title),
    tag('property', 'og:description', resolved.description),
    tag('property', 'og:type', resolved.type),
  ];

  if (resolved.canonicalUrl) {
    tags.push(tag('property', 'og:url', resolved.canonicalUrl));
    tags.push(`<link rel="canonical" href="${attr(resolved.canonicalUrl)}" />`);
  }

  if (resolved.imageUrl) {
    tags.push(tag('property', 'og:image', resolved.imageUrl));
    // Declared so a crawler can lay out the card before fetching the image.
    tags.push(tag('property', 'og:image:width', '1200'));
    tags.push(tag('property', 'og:image:height', '630'));
  }

  // summary_large_image only when there is an image to show large. With none,
  // it renders as an empty grey box rather than degrading to a small card.
  tags.push(
    tag(
      'name',
      'twitter:card',
      resolved.imageUrl ? 'summary_large_image' : 'summary',
    ),
  );

  if (resolved.publishedAt) {
    tags.push(
      tag(
        'property',
        'article:published_time',
        new Date(resolved.publishedAt).toISOString(),
      ),
    );
  }

  return tags.join('\n    ');
}

/**
 * Replaces the placeholder block in the built `index.html`.
 *
 * Marker-delimited rather than regex-over-`<head>`: the markers are explicit in
 * the source file, so a person reading `index.html` can see what gets replaced
 * and why, and Vite's asset-hashed script tags outside the block are untouched.
 *
 * If the markers are missing — a rebuilt template that dropped them — the HTML
 * is returned unchanged rather than half-injected. A page with stale default
 * tags is a worse card; a page with mangled `<head>` is a broken site.
 */
export function injectMeta(html: string, meta: PageMetaDto | null): string {
  const start = html.indexOf(META_BLOCK_START);
  const end = html.indexOf(META_BLOCK_END);
  if (start === -1 || end === -1 || end < start) return html;

  return (
    html.slice(0, start) +
    META_BLOCK_START +
    '\n    ' +
    buildMetaTags(meta) +
    '\n    ' +
    html.slice(end)
  );
}
