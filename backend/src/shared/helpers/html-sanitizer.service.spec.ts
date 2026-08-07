import { HtmlSanitizerService } from './html-sanitizer.service.js';

describe('HtmlSanitizerService', () => {
  let service: HtmlSanitizerService;

  beforeEach(() => {
    service = new HtmlSanitizerService();
  });

  describe('blocks script execution', () => {
    it('removes a script tag and its contents', () => {
      const result = service.sanitize('<p>Halo</p><script>alert(1)</script>');
      expect(result).not.toContain('script');
      expect(result).not.toContain('alert(1)');
      expect(result).toContain('<p>Halo</p>');
    });

    it('removes inline event handlers', () => {
      const result = service.sanitize(
        '<img src="https://x.test/a.jpg" alt="a" onerror="alert(1)" />',
      );
      expect(result).not.toContain('onerror');
      expect(result).toContain('src="https://x.test/a.jpg"');
    });

    it('removes a javascript: href', () => {
      const result = service.sanitize('<a href="javascript:alert(1)">klik</a>');
      expect(result).not.toContain('javascript:');
      expect(result).toContain('klik');
    });

    it('removes a data: URL image', () => {
      const result = service.sanitize(
        '<img src="data:text/html;base64,PHNjcmlwdD4=" alt="x" />',
      );
      expect(result).not.toContain('data:');
    });

    it('removes an iframe', () => {
      const result = service.sanitize(
        '<iframe src="https://evil.test"></iframe><p>sisa</p>',
      );
      expect(result).not.toContain('iframe');
      expect(result).toContain('<p>sisa</p>');
    });

    it('removes a style tag and its contents', () => {
      const result = service.sanitize(
        '<style>body{display:none}</style><p>a</p>',
      );
      expect(result).not.toContain('display:none');
    });

    it('escapes quotes so an attribute payload cannot break out', () => {
      const result = service.sanitize(
        '<a href="https://x.test" title="&quot;onmouseover=&quot;alert(1)">t</a>',
      );
      // The payload survives as escaped *text* inside title, which is inert.
      // What must not happen is an unescaped quote closing the attribute and
      // starting a real handler, so assert on the quote, not the word.
      expect(result).toContain('&quot;');
      expect(result).not.toMatch(/"\s*onmouseover/);
    });
  });

  describe('keeps what editors actually write', () => {
    it('keeps the formatting FR-009 requires', () => {
      const input =
        '<h2>Judul</h2><p><strong>tebal</strong> dan <em>miring</em></p>' +
        '<ul><li>satu</li></ul><ol><li>dua</li></ol>' +
        '<blockquote>kutipan</blockquote>' +
        '<table><tbody><tr><td>sel</td></tr></tbody></table>';
      const result = service.sanitize(input);

      for (const fragment of [
        '<h2>Judul</h2>',
        '<strong>tebal</strong>',
        '<em>miring</em>',
        '<li>satu</li>',
        '<li>dua</li>',
        '<blockquote>kutipan</blockquote>',
        '<td>sel</td>',
      ]) {
        expect(result).toContain(fragment);
      }
    });

    it('keeps an https link and an image with its alt text', () => {
      const result = service.sanitize(
        '<p><a href="https://mts241.test/berita">tautan</a></p>' +
          '<img src="https://mts241.test/a.webp" alt="Foto kegiatan" />',
      );
      expect(result).toContain('href="https://mts241.test/berita"');
      expect(result).toContain('alt="Foto kegiatan"');
    });

    it('keeps a mailto link', () => {
      const result = service.sanitize(
        '<a href="mailto:info@mts241.test">email</a>',
      );
      expect(result).toContain('mailto:info@mts241.test');
    });

    it('adds rel="noopener noreferrer" to links', () => {
      const result = service.sanitize('<a href="https://x.test">t</a>');
      expect(result).toContain('rel="noopener noreferrer"');
    });

    it('drops h1 so the page title stays the only one', () => {
      const result = service.sanitize('<h1>Judul</h1>');
      expect(result).not.toContain('<h1>');
      expect(result).toContain('Judul');
    });
  });

  it('is idempotent — sanitizing stored output changes nothing', () => {
    const once = service.sanitize(
      '<p>Halo</p><script>alert(1)</script><a href="https://x.test">t</a>',
    );
    expect(service.sanitize(once)).toBe(once);
  });

  it('handles an empty body', () => {
    expect(service.sanitize('')).toBe('');
  });
});
