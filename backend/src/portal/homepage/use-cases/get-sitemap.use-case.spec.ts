import { Test, TestingModule } from '@nestjs/testing';
import { PostType } from '../../post/domain/enums/post-type.enum.js';
import { IAgendaRepository } from '../../agenda/domain/interfaces/agenda-repository.interface.js';
import { IGalleryRepository } from '../../gallery/domain/interfaces/gallery-repository.interface.js';
import { IPageRepository } from '../../page/domain/interfaces/page-repository.interface.js';
import { IPostRepository } from '../../post/domain/interfaces/post-repository.interface.js';
import { GetSitemapUseCase } from './get-sitemap.use-case.js';
import { PortalCacheService } from '../../shared/services/portal-cache.service.js';

const NOW = new Date('2026-08-07T00:00:00.000Z');

/** The listing pages, one per public address space. */
const STATIC_PATHS = [
  '/',
  '/berita',
  '/artikel',
  '/pengumuman',
  '/agenda',
  '/galeri',
];

function entry(overrides: Record<string, unknown> = {}) {
  return {
    type: PostType.BERITA,
    slug: 'juara-1-olimpiade',
    publishedAt: new Date('2026-08-01T00:00:00.000Z'),
    updatedAt: new Date('2026-08-02T00:00:00.000Z'),
    ...overrides,
  };
}

/** The public response cache. Invalidation is fire-and-forget from the
 *  use case's point of view, so a no-op is the whole of it here. */
const cacheMock = { invalidate: jest.fn(), get: jest.fn(), set: jest.fn() };

describe('GetSitemapUseCase', () => {
  let useCase: GetSitemapUseCase;
  const repository = { findAllVisibleForSitemap: jest.fn() };
  const agendaRepository = { findAllVisible: jest.fn() };
  const galleryRepository = { findAllVisibleAlbums: jest.fn() };
  const pageRepository = { findAllVisible: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: PortalCacheService, useValue: cacheMock },
        GetSitemapUseCase,
        { provide: IPostRepository, useValue: repository },
        { provide: IAgendaRepository, useValue: agendaRepository },
        { provide: IGalleryRepository, useValue: galleryRepository },
        { provide: IPageRepository, useValue: pageRepository },
      ],
    }).compile();

    useCase = module.get(GetSitemapUseCase);
    jest.clearAllMocks();
    repository.findAllVisibleForSitemap.mockResolvedValue([entry()]);
    agendaRepository.findAllVisible.mockResolvedValue([]);
    galleryRepository.findAllVisibleAlbums.mockResolvedValue([]);
    pageRepository.findAllVisible.mockResolvedValue([]);
  });

  it('lists every visible item at its public address', async () => {
    const paths = (await useCase.execute(NOW)).map((row) => row.path);

    expect(paths).toContain('/berita/juara-1-olimpiade');
  });

  it('maps each content type to its own address space', async () => {
    repository.findAllVisibleForSitemap.mockResolvedValue([
      entry({ type: PostType.ARTIKEL, slug: 'kenapa-menulis' }),
      entry({ type: PostType.PENGUMUMAN, slug: 'libur-semester' }),
    ]);

    const paths = (await useCase.execute(NOW)).map((row) => row.path);

    expect(paths).toContain('/artikel/kenapa-menulis');
    expect(paths).toContain('/pengumuman/libur-semester');
  });

  it('includes every listing page, which exist whether or not anything is filed there', async () => {
    const paths = (await useCase.execute(NOW)).map((row) => row.path);

    expect(paths).toEqual(expect.arrayContaining(STATIC_PATHS));
  });

  /**
   * FR-067 says "every Published item", not "every published post". Agenda
   * entries, albums, and pages are public addresses a visitor can open and a
   * crawler should know about — omitting them made three quarters of the
   * portal invisible to search while every test still passed.
   */
  it('covers agenda, albums, and pages, not only posts', async () => {
    agendaRepository.findAllVisible.mockResolvedValue([
      { slug: 'pentas-seni', updatedAt: new Date('2026-08-03T00:00:00.000Z') },
    ]);
    galleryRepository.findAllVisibleAlbums.mockResolvedValue([
      {
        slug: 'pentas-seni-2026',
        updatedAt: new Date('2026-08-04T00:00:00.000Z'),
      },
    ]);
    pageRepository.findAllVisible.mockResolvedValue([
      { slug: 'profil', updatedAt: new Date('2026-08-02T00:00:00.000Z') },
    ]);

    const paths = (await useCase.execute(NOW)).map((row) => row.path);

    expect(paths).toEqual(
      expect.arrayContaining([
        '/berita/juara-1-olimpiade',
        '/agenda/pentas-seni',
        '/galeri/pentas-seni-2026',
        '/profil',
      ]),
    );
  });

  // Each module is asked for the set *it* judges visible, so the sitemap
  // inherits four predicates rather than restating one.
  it('asks every module for its own visible set at the same instant', async () => {
    await useCase.execute(NOW);

    expect(repository.findAllVisibleForSitemap).toHaveBeenCalledWith(NOW);
    expect(agendaRepository.findAllVisible).toHaveBeenCalledWith(NOW);
    expect(galleryRepository.findAllVisibleAlbums).toHaveBeenCalledWith(NOW);
    expect(pageRepository.findAllVisible).toHaveBeenCalledWith(NOW);
  });

  // A crawler uses lastModified to decide whether to re-fetch. An article
  // corrected last week has changed since it was published, even though its
  // publication date has not moved.
  it('reports when the item last changed, not when it was published', async () => {
    const entries = await useCase.execute(NOW);
    const item = entries[STATIC_PATHS.length];

    expect(item.lastModified).toEqual(new Date('2026-08-02T00:00:00.000Z'));
  });

  /**
   * FR-067, and the property worth guarding above all others here: the sitemap
   * composes the same visibility predicate every public listing does, so it
   * cannot contain something a visitor is unable to open.
   *
   * The failure this prevents is severe and quiet — a sitemap listing a draft's
   * address hands a crawler, and anyone who reads the sitemap, a map of
   * unpublished work.
   */
  it('contains nothing beyond what the repository judged visible', async () => {
    repository.findAllVisibleForSitemap.mockResolvedValue([]);

    const entries = await useCase.execute(NOW);

    // Only the static listing pages remain — no item paths at all.
    expect(entries.map((row) => row.path)).toEqual(STATIC_PATHS);
  });

  it('asks the repository for the visible set rather than filtering afterwards', async () => {
    await useCase.execute(NOW);

    expect(repository.findAllVisibleForSitemap).toHaveBeenCalledWith(NOW);
  });

  it('dates the listing pages by the newest item they hold', async () => {
    repository.findAllVisibleForSitemap.mockResolvedValue([
      entry({ updatedAt: new Date('2026-08-05T00:00:00.000Z') }),
      entry({ slug: 'lain', updatedAt: new Date('2026-08-03T00:00:00.000Z') }),
    ]);

    const [home] = await useCase.execute(NOW);

    expect(home.lastModified).toEqual(new Date('2026-08-05T00:00:00.000Z'));
  });
});
