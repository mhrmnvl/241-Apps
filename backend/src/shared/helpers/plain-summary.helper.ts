/**
 * Reduces stored HTML to a plain-text excerpt for a meta description.
 *
 * Lives in `shared/helpers/` for the same reason `slug.helper.ts` and
 * `html-sanitizer.service.ts` do: it is a text utility with no domain
 * knowledge, and several portal modules need it — pages, agenda entries, and
 * albums all have a body but no `summary` field of their own.
 *
 * A rough excerpt beats an empty description. A share card with no description
 * reads as broken, while a slightly awkward one still tells a reader what the
 * page is about.
 *
 * Tag-stripping by regex is deliberate here and would not be elsewhere: the
 * input has already been through `HtmlSanitizerService` on write, so there is
 * no adversarial markup left to defeat a naive strip — and the output is plain
 * text destined for an attribute value, not markup that gets re-rendered.
 */
export function toPlainSummary(html: string | null, limit = 160): string {
  if (!html) return '';

  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= limit) return text;

  // Cut at a word boundary rather than mid-word. `lastIndexOf` returns -1 when
  // the first `limit` characters hold no space at all — one very long token —
  // in which case a hard cut is the only option left.
  const boundary = text.lastIndexOf(' ', limit);
  return `${text.slice(0, boundary > 0 ? boundary : limit)}…`;
}
