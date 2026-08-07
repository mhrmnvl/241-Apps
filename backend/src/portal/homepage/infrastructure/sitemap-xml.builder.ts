import { SitemapEntryDto } from '../dto/response/page-meta.dto.js';

/**
 * Renders the sitemap protocol's XML (FR-067, SC-014).
 *
 * Hand-written rather than pulled from a library: the format is one element
 * with two children, the whole grammar fits in this file, and a dependency
 * whose entire job is string concatenation is a dependency to keep patched for
 * no reason.
 *
 * `<loc>` must be absolute — the protocol requires it, and a crawler reading
 * the file has no page context to resolve a relative path against.
 */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function buildSitemapXml(
  entries: SitemapEntryDto[],
  baseUrl: string,
): string {
  const base = baseUrl.replace(/\/+$/, '');

  const urls = entries
    .map((entry) => {
      const loc = escapeXml(`${base}${entry.path}`);
      const lastmod = new Date(entry.lastModified).toISOString();
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

/**
 * A minimal robots.txt pointing at the sitemap.
 *
 * Without it a crawler has to be told the sitemap's address out of band, which
 * for a school nobody will do. Everything is allowed except the management
 * area — which is behind auth anyway, so this is about keeping it out of search
 * results rather than about access control.
 */
export function buildRobotsTxt(baseUrl: string): string {
  const base = baseUrl.replace(/\/+$/, '');
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin/',
    'Disallow: /login',
    '',
    `Sitemap: ${base}/sitemap.xml`,
    '',
  ].join('\n');
}
