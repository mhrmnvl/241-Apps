import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { Controller, Get, Logger, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { Public } from '../../../core/decorators/public.decorator.js';
import { PageMetaDto } from '../dto/response/page-meta.dto.js';
import { GetPageMetaUseCase } from '../use-cases/get-page-meta.use-case.js';
import { GetSitemapUseCase } from '../use-cases/get-sitemap.use-case.js';
import { injectMeta } from '../infrastructure/meta-tag.builder.js';
import {
  buildRobotsTxt,
  buildSitemapXml,
} from '../infrastructure/sitemap-xml.builder.js';

/** Paths the API owns. The SPA shell must never answer for these. */
const API_PREFIXES = [
  '/portal/',
  '/api',
  '/auth',
  '/files',
  '/docs',
  '/health',
];

/**
 * Serves the portal's built `index.html` with per-path metadata injected
 * server-side (research R3, Option A — confirmed by the requester).
 *
 * WhatsApp and Facebook crawlers do not execute JavaScript, so a client-rendered
 * SPA returns an empty shell and every shared link previews as a bare URL. This
 * fills the tags in before the HTML leaves the server.
 *
 * Two rules this deliberately follows:
 *
 * 1. **Inject for every request, never only for crawler user-agents.** Serving
 *    different HTML to bots than to people is cloaking; it risks a search
 *    penalty, and Google no longer recommends dynamic rendering. A browser
 *    simply ignores the meta tags it has no use for, so there is nothing to
 *    gain from the distinction and a real penalty on offer for getting it wrong.
 *
 * 2. **A path with no public metadata falls back to the portal's default tags**
 *    and still returns the SPA shell, so client-side routing renders its own 404
 *    page. Returning an HTTP 404 with no HTML would replace the portal's
 *    not-found page with the browser's.
 */
@ApiExcludeController()
@Controller()
export class PortalHtmlController {
  private readonly logger = new Logger(PortalHtmlController.name);

  /** Read once per request in dev, cached in production — the file only ever
   *  changes on deploy, and re-reading it per request is a syscall per visit. */
  private cachedHtml: string | null = null;

  constructor(
    private readonly getPageMetaUseCase: GetPageMetaUseCase,
    private readonly getSitemapUseCase: GetSitemapUseCase,
    private readonly config: ConfigService,
  ) {}

  /**
   * The sitemap a crawler can actually consume (FR-067, SC-014).
   *
   * `/portal/public/sitemap` returns the same data as JSON inside the API
   * envelope, which is right for a client and useless to a search engine. This
   * is the conventional address in the conventional format, and it is served
   * from here because this is the controller that already owns the portal's
   * non-API paths.
   *
   * Declared before the `GET *` catch-all — Nest matches handlers within a
   * controller in declaration order, and the catch-all would otherwise answer
   * with HTML.
   */
  @Get('sitemap.xml')
  @Public()
  async sitemap(@Res() res: Response) {
    const entries = await this.getSitemapUseCase.execute();
    res.type('application/xml').send(buildSitemapXml(entries, this.baseUrl()));
  }

  /** Points crawlers at the sitemap; without it nobody tells them it exists. */
  @Get('robots.txt')
  @Public()
  robots(@Res() res: Response) {
    res.type('text/plain').send(buildRobotsTxt(this.baseUrl()));
  }

  @Get('*path')
  @Public()
  async serve(@Req() req: Request, @Res() res: Response) {
    const path = req.path;

    // Anything the API owns is not the SPA's to answer. Without this the
    // catch-all would swallow a genuine 404 from an API route and reply with
    // HTML, which is a confusing failure for a client expecting JSON.
    if (API_PREFIXES.some((prefix) => path.startsWith(prefix))) {
      res.status(404).json({ statusCode: 404, message: 'Not Found' });
      return;
    }

    const html = await this.loadHtml();
    if (html === null) {
      // No build present — the API is running without the portal's static
      // assets, which is normal in a backend-only dev session.
      res.status(404).send('Portal build not found');
      return;
    }

    res.type('html').send(injectMeta(html, await this.resolveMeta(path)));
  }

  /**
   * `null` when the path resolves to nothing public, which is the signal to
   * fall back to the defaults. A failure here is logged and treated the same
   * way: a card with generic tags is a far better outcome than a 500 on the
   * school's homepage because the metadata lookup had a bad minute.
   */
  private async resolveMeta(path: string): Promise<PageMetaDto | null> {
    try {
      return await this.getPageMetaUseCase.execute(path);
    } catch (error) {
      if (!isNotFound(error)) {
        this.logger.warn(
          `Metadata lookup failed for ${path}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
      return null;
    }
  }

  private baseUrl(): string {
    return (
      this.config.get<string>('PORTAL_BASE_URL') ?? 'http://localhost:5176'
    );
  }

  private async loadHtml(): Promise<string | null> {
    if (this.cachedHtml !== null) return this.cachedHtml;

    const root =
      this.config.get<string>('PORTAL_DIST_PATH') ??
      resolve(process.cwd(), '../apps/portal/dist');

    try {
      const html = await readFile(join(root, 'index.html'), 'utf8');
      if (this.config.get<string>('NODE_ENV') === 'production') {
        this.cachedHtml = html;
      }
      return html;
    } catch {
      return null;
    }
  }
}

function isNotFound(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    (error as { status: number }).status === 404
  );
}
