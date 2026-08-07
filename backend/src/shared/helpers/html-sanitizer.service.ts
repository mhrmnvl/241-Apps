import { Injectable } from '@nestjs/common';
import sanitizeHtml from 'sanitize-html';

// Allowlist, never a denylist: anything not named here is dropped. The editor
// (TipTap) is not the trust boundary — the API is, because a caller can POST
// straight to it — so this runs on write and the stored row is already clean.
const ALLOWED_TAGS = [
  'h2',
  'h3',
  'h4',
  'p',
  'br',
  'hr',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'ul',
  'ol',
  'li',
  'blockquote',
  'a',
  'img',
  'figure',
  'figcaption',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
];

const ALLOWED_ATTRIBUTES: sanitizeHtml.IOptions['allowedAttributes'] = {
  a: ['href', 'title', 'target', 'rel'],
  img: ['src', 'alt', 'title', 'width', 'height'],
  th: ['colspan', 'rowspan'],
  td: ['colspan', 'rowspan'],
};

// h1 is deliberately absent from ALLOWED_TAGS: the page title is the h1, and a
// second one in the body breaks the document outline for screen readers.
@Injectable()
export class HtmlSanitizerService {
  sanitize(dirty: string): string {
    return sanitizeHtml(dirty, {
      allowedTags: ALLOWED_TAGS,
      allowedAttributes: ALLOWED_ATTRIBUTES,
      // Blocks javascript:, vbscript: and data: URLs in href/src.
      allowedSchemes: ['http', 'https', 'mailto'],
      allowedSchemesAppliedToAttributes: ['href', 'src'],
      // Drop the contents of stripped tags too — otherwise the text inside a
      // <script> survives as visible body copy.
      nonTextTags: ['style', 'script', 'textarea', 'option', 'noscript'],
      transformTags: {
        // Anything leaving the site opens in a new tab and must not hand the
        // opener over to the destination.
        a: sanitizeHtml.simpleTransform('a', {
          rel: 'noopener noreferrer',
        }),
      },
    });
  }
}
