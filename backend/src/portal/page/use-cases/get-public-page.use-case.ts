import { Injectable, NotFoundException } from '@nestjs/common';
import { toPlainSummary } from '../../../shared/helpers/plain-summary.helper.js';
import { IPageRepository } from '../domain/interfaces/page-repository.interface.js';

export type PublicPageResult =
  | {
      kind: 'found';
      page: {
        id: string;
        title: string;
        slug: string;
        body: string;
        metaTitle: string;
        metaDescription: string;
        publishedAt: Date;
        updatedAt: Date;
      };
    }
  | { kind: 'moved'; slug: string };

@Injectable()
export class GetPublicPageUseCase {
  constructor(private readonly pageRepository: IPageRepository) {}

  async execute(slug: string): Promise<PublicPageResult> {
    const page = await this.pageRepository.findPublicBySlug(slug);

    if (page) {
      return {
        kind: 'found',
        page: {
          id: page.id,
          title: page.title,
          slug: page.slug,
          body: page.body,
          // Same fallback the posts use: a blank override means "no override",
          // not "publish an empty tag" (FR-068). Written as an explicit check
          // rather than `??`, which would keep the empty string an editor
          // creates by clearing the field.
          metaTitle: firstNonBlank(page.metaTitle, page.title),
          metaDescription: firstNonBlank(
            page.metaDescription,
            toPlainSummary(page.body),
          ),
          publishedAt: page.publishedAt!,
          updatedAt: page.updatedAt,
        },
      };
    }

    const moved = await this.pageRepository.findByHistoricalSlug(slug);
    if (moved) return { kind: 'moved', slug: moved.currentSlug };

    throw new NotFoundException('Halaman tidak ditemukan');
  }
}

/** '' and '   ' both mean "no override" — only then does the fallback apply. */
function firstNonBlank(override: string | null, fallback: string): string {
  const trimmed = override?.trim();
  return trimmed !== undefined && trimmed.length > 0 ? trimmed : fallback;
}
