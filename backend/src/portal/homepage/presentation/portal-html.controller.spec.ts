import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import type { Request, Response } from 'express';
import { GetPageMetaUseCase } from '../use-cases/get-page-meta.use-case.js';
import { GetSitemapUseCase } from '../use-cases/get-sitemap.use-case.js';
import { PortalHtmlController } from './portal-html.controller.js';
import { PortalCacheService } from '../../shared/services/portal-cache.service.js';

const SHELL = `<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <!-- speckit:meta:start -->
    <title>Portal MTs Persis 241 Al-Ikhlash</title>
    <meta name="description" content="Default" />
    <!-- speckit:meta:end -->
    <script type="module" src="/assets/index-a1b2c3.js"></script>
  </head>
  <body><div id="app"></div></body>
</html>`;

/** The public response cache. Invalidation is fire-and-forget from the
 *  use case's point of view, so a no-op is the whole of it here. */
const cacheMock = { invalidate: jest.fn(), get: jest.fn(), set: jest.fn() };

const ARTICLE_META = {
  title: 'Juara 1 Olimpiade',
  description: 'Ringkasan',
  canonicalUrl: 'https://portal.example.sch.id/berita/juara-1-olimpiade',
  imageUrl:
    'https://portal.example.sch.id/portal/public/media/abc?variant=preview',
  type: 'article' as const,
  publishedAt: new Date('2026-08-01T00:00:00.000Z'),
};

describe('PortalHtmlController', () => {
  let controller: PortalHtmlController;
  let distPath: string;
  const getPageMeta = { execute: jest.fn() };
  const getSitemap = { execute: jest.fn().mockResolvedValue([]) };

  /** Captures what the controller sent, without an HTTP server. */
  function responseSpy() {
    const sent = {
      status: 200,
      body: '' as unknown,
      contentType: '',
    };
    const res = {
      status(code: number) {
        sent.status = code;
        return this;
      },
      type(value: string) {
        sent.contentType = value;
        return this;
      },
      send(body: unknown) {
        sent.body = body;
        return this;
      },
      json(body: unknown) {
        sent.body = body;
        return this;
      },
    } as unknown as Response;
    return { res, sent };
  }

  const request = (path: string) => ({ path }) as Request;

  beforeAll(async () => {
    distPath = await mkdtemp(join(tmpdir(), 'portal-dist-'));
    await writeFile(join(distPath, 'index.html'), SHELL, 'utf8');
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: PortalCacheService, useValue: cacheMock },
        PortalHtmlController,
        { provide: GetPageMetaUseCase, useValue: getPageMeta },
        { provide: GetSitemapUseCase, useValue: getSitemap },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) =>
              key === 'PORTAL_DIST_PATH' ? distPath : 'test',
          },
        },
      ],
    }).compile();

    controller = module.get(PortalHtmlController);
    jest.clearAllMocks();
    getPageMeta.execute.mockResolvedValue(ARTICLE_META);
  });

  it('injects the resolved metadata into the shell', async () => {
    const { res, sent } = responseSpy();

    await controller.serve(request('/berita/juara-1-olimpiade'), res);
    const html = sent.body as string;

    expect(html).toContain('<title>Juara 1 Olimpiade</title>');
    expect(html).toContain('property="og:title" content="Juara 1 Olimpiade"');
    expect(html).toContain('property="og:description" content="Ringkasan"');
    expect(html).toContain('property="og:type" content="article"');
    expect(html).toContain('name="twitter:card"');
    expect(html).toContain(
      'property="og:site_name" content="MTs Persis 241 Al-Ikhlash"',
    );
  });

  it('points og:image at the preview variant it was given', async () => {
    const { res, sent } = responseSpy();

    await controller.serve(request('/berita/juara-1-olimpiade'), res);

    expect(sent.body as string).toContain('?variant=preview');
  });

  it('leaves the built asset tags alone', async () => {
    const { res, sent } = responseSpy();

    await controller.serve(request('/berita/juara-1-olimpiade'), res);

    expect(sent.body as string).toContain('/assets/index-a1b2c3.js');
  });

  /**
   * Rule one, and a deliberate decision rather than an oversight: serving
   * different HTML to bots than to people is cloaking. It risks a search
   * penalty, Google no longer recommends dynamic rendering, and a browser
   * simply ignores meta tags it has no use for — so there is nothing to gain
   * from the distinction and a real penalty on offer for getting it wrong.
   */
  it('injects for every request, never only for crawler user-agents', async () => {
    for (const _ of ['a browser', 'a crawler']) {
      const { res, sent } = responseSpy();
      await controller.serve(request('/berita/juara-1-olimpiade'), res);
      expect(sent.body as string).toContain('<title>Juara 1 Olimpiade</title>');
    }

    // The controller never looked at a header to decide.
    expect(getPageMeta.execute).toHaveBeenCalledTimes(2);
  });

  /**
   * Rule two: a path with no public metadata falls back to the portal's default
   * tags and still returns the SPA shell, so client-side routing renders the
   * portal's own 404 page. An HTTP 404 with no HTML would replace it with the
   * browser's.
   */
  describe('a path that resolves to nothing public', () => {
    beforeEach(() => {
      getPageMeta.execute.mockRejectedValue(new NotFoundException());
    });

    it('still returns the SPA shell with a 200', async () => {
      const { res, sent } = responseSpy();

      await controller.serve(request('/berita/tidak-ada'), res);

      expect(sent.status).toBe(200);
      expect(sent.body as string).toContain('<div id="app">');
    });

    it('falls back to the default tags rather than inventing any', async () => {
      const { res, sent } = responseSpy();

      await controller.serve(request('/berita/tidak-ada'), res);
      const html = sent.body as string;

      expect(html).toContain('<title>Portal MTs Persis 241 Al-Ikhlash</title>');
      expect(html).not.toContain('Juara 1 Olimpiade');
    });
  });

  // Without this the catch-all swallows a genuine API 404 and answers it with
  // HTML, which is a baffling failure for a client expecting JSON.
  it('does not answer for paths the API owns', async () => {
    const { res, sent } = responseSpy();

    await controller.serve(request('/portal/public/posts/berita/x'), res);

    expect(sent.status).toBe(404);
    expect(sent.body).toEqual({ statusCode: 404, message: 'Not Found' });
  });

  // An editor's title is attacker-influenced text landing inside an attribute.
  // Escaping it is what stops a quote from closing `content="` and letting the
  // rest be parsed as markup — sanitizing the article body would never catch it.
  it('escapes quotes in a title so they cannot break out of the attribute', async () => {
    getPageMeta.execute.mockResolvedValue({
      ...ARTICLE_META,
      title: 'Juara "1" Olimpiade',
      description: '<script>alert(1)</script>',
    });
    const { res, sent } = responseSpy();

    await controller.serve(request('/berita/juara-1-olimpiade'), res);
    const html = sent.body as string;

    expect(html).toContain('content="Juara &quot;1&quot; Olimpiade"');
    expect(html).not.toContain('<script>alert(1)</script>');
  });

  it('404s plainly when no portal build is present', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: PortalCacheService, useValue: cacheMock },
        PortalHtmlController,
        { provide: GetPageMetaUseCase, useValue: getPageMeta },
        { provide: GetSitemapUseCase, useValue: getSitemap },
        {
          provide: ConfigService,
          useValue: { get: () => join(tmpdir(), 'no-such-portal-dist') },
        },
      ],
    }).compile();
    const { res, sent } = responseSpy();

    await module.get(PortalHtmlController).serve(request('/'), res);

    expect(sent.status).toBe(404);
  });
});
