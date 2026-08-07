import { Injectable, Logger } from '@nestjs/common';
import { IAgendaRepository } from '../../agenda/domain/interfaces/agenda-repository.interface.js';
import { toPublicAgenda } from '../../agenda/infrastructure/mappers/agenda.mapper.js';
import { IGalleryRepository } from '../../gallery/domain/interfaces/gallery-repository.interface.js';
import { toPublicAlbumSummary } from '../../gallery/infrastructure/mappers/gallery.mapper.js';
import { IPostRepository } from '../../post/domain/interfaces/post-repository.interface.js';
import { toPublicSummary } from '../../post/infrastructure/mappers/post.mapper.js';
import { IHomepageSectionRepository } from '../domain/interfaces/homepage-section-repository.interface.js';
import {
  HomepageResponseDto,
  HomepageSectionDto,
} from '../dto/response/homepage-response.dto.js';
import {
  HOMEPAGE_SECTION_KEYS,
  POST_BACKED_SECTIONS,
} from '../constants/homepage.constants.js';

/**
 * One round trip for the whole homepage.
 *
 * Content is borrowed through each module's repository port — this module owns
 * section configuration and nothing else, and must never reach into another
 * module's tables (Principle VI). A section whose key nothing recognises
 * resolves empty, which renders its empty state rather than breaking the page
 * (FR-031).
 */
@Injectable()
export class GetHomepageUseCase {
  private readonly logger = new Logger(GetHomepageUseCase.name);

  constructor(
    private readonly sectionRepository: IHomepageSectionRepository,
    private readonly postRepository: IPostRepository,
    private readonly agendaRepository: IAgendaRepository,
    private readonly galleryRepository: IGalleryRepository,
  ) {}

  /**
   * `allSettled`, not `all` — FR-032.
   *
   * The sections are four independent reads against four modules. With `all`, a
   * single failing repository rejects the whole response and the school's
   * homepage returns a 500: the news is fine, the agenda is fine, but a hiccup
   * fetching albums takes the entire page down. A section that cannot be
   * retrieved degrades to its own empty state instead, which is the same thing
   * a visitor sees when it is genuinely empty.
   *
   * The failure is logged at error level rather than swallowed, because a
   * section that is quietly always-empty looks identical to one nobody has
   * filled in yet — and that is exactly the bug nobody notices.
   */
  async execute(): Promise<HomepageResponseDto> {
    const sections = await this.sectionRepository.findAllEnabled();

    const settled = await Promise.allSettled(
      sections.map((section) => this.resolveSection(section)),
    );

    const resolved = settled.map((outcome, index) => {
      if (outcome.status === 'fulfilled') return outcome.value;

      const section = sections[index];
      this.logger.error(
        `Homepage section "${section.key}" could not be retrieved: ${
          outcome.reason instanceof Error
            ? outcome.reason.message
            : String(outcome.reason)
        }`,
      );

      return {
        key: section.key,
        displayOrder: section.displayOrder,
        kind: 'post' as const,
        items: [],
      };
    });

    return { sections: resolved };
  }

  private async resolveSection(section: {
    key: string;
    itemCount: number;
    displayOrder: number;
  }): Promise<HomepageSectionDto> {
    const base = { key: section.key, displayOrder: section.displayOrder };

    if (section.key === HOMEPAGE_SECTION_KEYS.AGENDA) {
      // Nearest-upcoming only. A homepage agenda listing last month's events
      // is worse than an empty one — it tells a visitor the school stopped
      // doing things (FR-040).
      const entries = await this.agendaRepository.findUpcoming(
        section.itemCount,
      );
      return { ...base, kind: 'agenda', items: entries.map(toPublicAgenda) };
    }

    if (section.key === HOMEPAGE_SECTION_KEYS.GALERI) {
      const albums = await this.galleryRepository.findLatestPublicAlbums(
        section.itemCount,
      );
      return {
        ...base,
        kind: 'album',
        items: albums.map(toPublicAlbumSummary),
      };
    }

    const postType = POST_BACKED_SECTIONS[section.key];
    if (!postType) {
      // A configured section key nothing knows how to fill. Rendering its empty
      // state beats a 500 on the school's homepage over a typo in seed data.
      return { ...base, kind: 'album', items: [] };
    }

    const posts = await this.postRepository.findLatestPublic(
      postType,
      section.itemCount,
    );

    return { ...base, kind: 'post', items: posts.map(toPublicSummary) };
  }
}
