import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { toPlainSummary } from '../../../shared/helpers/plain-summary.helper.js';
import { IAgendaRepository } from '../../agenda/domain/interfaces/agenda-repository.interface.js';
import { IGalleryRepository } from '../../gallery/domain/interfaces/gallery-repository.interface.js';
import { GetPublicPageUseCase } from '../../page/use-cases/get-public-page.use-case.js';
import { PUBLIC_MEDIA_PATH } from '../../post/constants/post.constants.js';
import { GetPublicPostBySlugUseCase } from '../../post/use-cases/get-public-post-by-slug.use-case.js';
import {
  PORTAL_DEFAULT_META,
  PREVIEW_VARIANT,
  postTypeFromPath,
} from '../constants/meta.constants.js';
import { PageMetaDto } from '../dto/response/page-meta.dto.js';

/** What a resolver hands back before URLs are made absolute. */
interface ResolvedMeta {
  title: string;
  description: string;
  coverFileId: string | null;
  publishedAt: Date | null;
}

/**
 * Resolves any public portal path to the tags a link preview needs (FR-065).
 *
 * Lives in a use case rather than in a proxy config or an edge function, which
 * is the whole argument of research R3: this way the logic sits next to the
 * data it needs and is unit-testable like anything else. A rewrite rule in a
 * config file is exercised by no test in this repository.
 *
 * **Every public address shape is covered**, not just posts. A parent sharing
 * an agenda entry or a photo album in a WhatsApp group is the same act as
 * sharing an article, and FR-065 does not distinguish between them.
 */
@Injectable()
export class GetPageMetaUseCase {
  constructor(
    private readonly getPublicPostBySlug: GetPublicPostBySlugUseCase,
    private readonly getPublicPage: GetPublicPageUseCase,
    private readonly agendaRepository: IAgendaRepository,
    private readonly galleryRepository: IGalleryRepository,
    private readonly config: ConfigService,
  ) {}

  async execute(path: string): Promise<PageMetaDto> {
    const canonicalUrl = this.absolute(path);
    const segments = path.split('/').filter(Boolean);

    // The homepage and every listing share the site-level card. They are index
    // pages: there is no single item to describe, and inventing one from the
    // newest article would make the card change under a link already shared.
    if (segments.length === 0) {
      return this.siteCard(canonicalUrl);
    }

    const resolved = await this.resolve(segments);

    // A listing address, or a segment naming no content type at all. Both are
    // the site card rather than a 404 — `/berita` is a real page, and guessing
    // wrong about `/anything` costs a generic card rather than a broken one.
    if (resolved === 'listing') return this.siteCard(canonicalUrl);

    // 404 so the caller falls through to the portal's own default tags instead
    // of the API inventing metadata for something a visitor cannot see.
    if (resolved === null) {
      throw new NotFoundException('Page not found');
    }

    return {
      title: resolved.title,
      description: resolved.description,
      canonicalUrl,
      // The preview variant, never the original: WhatsApp in particular drops
      // an image it considers too large and renders a card with no picture at
      // all, which reads as a bug and is not one (T114).
      imageUrl: resolved.coverFileId
        ? `${this.absolute(`${PUBLIC_MEDIA_PATH}/${resolved.coverFileId}`)}?variant=${PREVIEW_VARIANT}`
        : null,
      type: 'article',
      publishedAt: resolved.publishedAt,
    };
  }

  /**
   * `'listing'` for an index page, `null` for nothing public, otherwise the item.
   *
   * Ordered to match the frontend router: named type segments first, then the
   * single-segment page catch-all — the same precedence, so the two cannot
   * disagree about what an address means.
   */
  private async resolve(
    segments: string[],
  ): Promise<ResolvedMeta | 'listing' | null> {
    const [first, second] = segments;

    if (segments.length === 1) {
      // `/berita`, `/agenda`, `/galeri` are listings; anything else is a page.
      if (postTypeFromPath(first) || first === 'agenda' || first === 'galeri') {
        return 'listing';
      }
      return this.resolvePage(first);
    }

    if (segments.length !== 2) return null;

    const postType = postTypeFromPath(first);
    if (postType) return this.resolvePost(postType, second);
    if (first === 'agenda') return this.resolveAgenda(second);
    if (first === 'galeri') return this.resolveAlbum(second);

    return null;
  }

  private async resolvePost(
    type: Parameters<GetPublicPostBySlugUseCase['executeOrThrow']>[0],
    slug: string,
  ): Promise<ResolvedMeta | null> {
    const post = await this.getPublicPostBySlug
      .executeOrThrow(type, slug)
      .catch(() => null);
    if (!post) return null;

    return {
      title: post.metaTitle,
      description: post.metaDescription,
      // The DTO carries a public media path; the id is what this needs, so the
      // variant suffix can be appended without string surgery on a URL.
      coverFileId: post.coverImageUrl?.split('/').pop() ?? null,
      publishedAt: post.publishedAt,
    };
  }

  private async resolveAgenda(slug: string): Promise<ResolvedMeta | null> {
    const entry = await this.agendaRepository.findPublicBySlug(slug);
    if (!entry) return null;

    return {
      title: entry.title,
      // An agenda entry has no summary field, so the description falls back to
      // its body with the markup taken out.
      description: toPlainSummary(entry.description),
      coverFileId: entry.coverFileId,
      publishedAt: entry.publishedAt,
    };
  }

  private async resolveAlbum(slug: string): Promise<ResolvedMeta | null> {
    const album = await this.galleryRepository.findPublicAlbumBySlug(slug);
    if (!album) return null;

    return {
      title: album.title,
      description: toPlainSummary(album.description),
      coverFileId: album.coverFileId,
      publishedAt: album.publishedAt,
    };
  }

  private async resolvePage(slug: string): Promise<ResolvedMeta | null> {
    const result = await this.getPublicPage.execute(slug).catch(() => null);
    // A moved address is not the item: resolving it here would hand back
    // metadata for a different URL than the one requested.
    if (result?.kind !== 'found') return null;

    return {
      title: result.page.metaTitle,
      description: result.page.metaDescription,
      // Informational pages have no cover image of their own.
      coverFileId: null,
      publishedAt: result.page.publishedAt,
    };
  }

  private siteCard(canonicalUrl: string): PageMetaDto {
    return {
      ...PORTAL_DEFAULT_META,
      canonicalUrl,
      imageUrl: null,
      type: 'website',
      publishedAt: null,
    };
  }

  /**
   * Absolute, because `og:url` and `og:image` are read by a crawler with no
   * page context — a relative path there produces a card with no image and a
   * link to nowhere.
   */
  private absolute(path: string): string {
    const base = (
      this.config.get<string>('PORTAL_BASE_URL') ?? 'http://localhost:5176'
    ).replace(/\/+$/, '');
    return `${base}${path.startsWith('/') ? path : `/${path}`}`;
  }
}
