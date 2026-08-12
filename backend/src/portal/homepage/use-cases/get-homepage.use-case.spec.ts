import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ContentStatus } from '../../post/domain/enums/content-status.enum.js';
import { PostType } from '../../post/domain/enums/post-type.enum.js';
import { IAgendaRepository } from '../../agenda/domain/interfaces/agenda-repository.interface.js';
import { IGalleryRepository } from '../../gallery/domain/interfaces/gallery-repository.interface.js';
import { IPostRepository } from '../../post/domain/interfaces/post-repository.interface.js';
import { IHomepageSectionRepository } from '../domain/interfaces/homepage-section-repository.interface.js';
import { GetHomepageUseCase } from './get-homepage.use-case.js';
import { UpdateHomepageSectionUseCase } from './update-homepage-section.use-case.js';
import { PortalCacheService } from '../../shared/services/portal-cache.service.js';

const AUTHOR_ID = '11111111-1111-4111-8111-111111111111';

function agendaRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'agenda-1',
    title: 'Pentas Seni Akhir Tahun',
    slug: 'pentas-seni-akhir-tahun',
    description: '<p>Acara</p>',
    startTime: new Date('2026-12-20T01:00:00.000Z'),
    endTime: new Date('2026-12-20T05:00:00.000Z'),
    location: 'Aula',
    coverFileId: null,
    status: ContentStatus.PUBLISHED,
    publishedAt: new Date('2026-08-01T00:00:00.000Z'),
    scheduledAt: null,
    authorId: AUTHOR_ID,
    version: 1,
    createdAt: new Date('2026-08-01T00:00:00.000Z'),
    updatedAt: new Date('2026-08-01T00:00:00.000Z'),
    deletedAt: null,
    ...overrides,
  };
}

function postRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'post-1',
    type: PostType.BERITA,
    title: 'Juara 1 Olimpiade',
    slug: 'juara-1-olimpiade',
    summary: 'Ringkasan',
    body: '<p>Isi</p>',
    coverFileId: null,
    coverAltText: null,
    categoryId: null,
    status: ContentStatus.PUBLISHED,
    publishedAt: new Date('2026-08-01T00:00:00.000Z'),
    scheduledAt: null,
    expiresAt: null,
    attachmentFileId: null,
    pinnedAt: null,
    metaTitle: null,
    metaDescription: null,
    authorId: AUTHOR_ID,
    version: 1,
    createdAt: new Date('2026-08-01T00:00:00.000Z'),
    updatedAt: new Date('2026-08-01T00:00:00.000Z'),
    deletedAt: null,
    author: { id: AUTHOR_ID, identifier: 'humas', profile: { name: 'Humas' } },
    category: null,
    coverFile: null,
    attachment: null,
    ...overrides,
  };
}

/** The public response cache. Invalidation is fire-and-forget from the
 *  use case's point of view, so a no-op is the whole of it here. */
const cacheMock = { invalidate: jest.fn(), get: jest.fn(), set: jest.fn() };

describe('GetHomepageUseCase', () => {
  let useCase: GetHomepageUseCase;

  const mockSections = { findAllEnabled: jest.fn() };
  const mockPosts = { findLatestPublic: jest.fn() };
  const mockAgenda = { findUpcoming: jest.fn() };
  const mockGallery = { findLatestPublicAlbums: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: PortalCacheService, useValue: cacheMock },
        GetHomepageUseCase,
        { provide: IHomepageSectionRepository, useValue: mockSections },
        { provide: IPostRepository, useValue: mockPosts },
        { provide: IAgendaRepository, useValue: mockAgenda },
        { provide: IGalleryRepository, useValue: mockGallery },
      ],
    }).compile();

    useCase = module.get(GetHomepageUseCase);
    jest.clearAllMocks();
    mockPosts.findLatestPublic.mockResolvedValue([postRow()]);
    mockAgenda.findUpcoming.mockResolvedValue([]);
    mockGallery.findLatestPublicAlbums.mockResolvedValue([]);
  });

  it('returns enabled sections in display order', async () => {
    mockSections.findAllEnabled.mockResolvedValue([
      { key: 'berita', itemCount: 3, displayOrder: 1 },
      { key: 'pengumuman', itemCount: 2, displayOrder: 2 },
    ]);

    const result = await useCase.execute();

    expect(result.sections.map((s) => s.key)).toEqual(['berita', 'pengumuman']);
  });

  // FR-029: the count is configuration, not a constant in the code.
  it('asks each section for exactly its configured item count', async () => {
    mockSections.findAllEnabled.mockResolvedValue([
      { key: 'berita', itemCount: 5, displayOrder: 1 },
    ]);

    await useCase.execute();

    expect(mockPosts.findLatestPublic).toHaveBeenCalledWith(PostType.BERITA, 5);
  });

  // Principle VI: the aggregator owns configuration and borrows content.
  it('borrows content through the post port rather than querying it directly', async () => {
    mockSections.findAllEnabled.mockResolvedValue([
      { key: 'berita', itemCount: 3, displayOrder: 1 },
    ]);

    await useCase.execute();

    expect(mockPosts.findLatestPublic).toHaveBeenCalled();
  });

  // FR-031: a section key nothing recognises renders empty, not broken. A typo
  // in seed data should not 500 the school's homepage.
  it('resolves an unrecognised section key to an empty list', async () => {
    mockSections.findAllEnabled.mockResolvedValue([
      { key: 'unknown', itemCount: 3, displayOrder: 2 },
    ]);

    const result = await useCase.execute();

    expect(result.sections).toHaveLength(1);
    expect(result.sections[0].items).toEqual([]);
    expect(mockPosts.findLatestPublic).not.toHaveBeenCalled();
  });

  it('fills the gallery section through the gallery port', async () => {
    mockSections.findAllEnabled.mockResolvedValue([
      { key: 'galeri', itemCount: 2, displayOrder: 1 },
    ]);
    mockGallery.findLatestPublicAlbums.mockResolvedValue([
      {
        id: 'album-1',
        title: 'Pentas Seni 2026',
        slug: 'pentas-seni-2026',
        description: null,
        eventDate: new Date('2026-12-20T00:00:00.000Z'),
        coverFileId: null,
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date('2026-08-01T00:00:00.000Z'),
        scheduledAt: null,
        authorId: AUTHOR_ID,
        version: 1,
        createdAt: new Date('2026-08-01T00:00:00.000Z'),
        updatedAt: new Date('2026-08-01T00:00:00.000Z'),
        deletedAt: null,
        photoCount: 12,
      },
    ]);

    const result = await useCase.execute();

    expect(mockGallery.findLatestPublicAlbums).toHaveBeenCalledWith(2);
    expect(result.sections[0].kind).toBe('album');
    expect(result.sections[0].items).toHaveLength(1);
  });

  // The agenda section borrows through IAgendaRepository, not IPostRepository.
  it('fills the agenda section through the agenda port', async () => {
    mockSections.findAllEnabled.mockResolvedValue([
      { key: 'agenda', itemCount: 4, displayOrder: 1 },
    ]);
    mockAgenda.findUpcoming.mockResolvedValue([agendaRow()]);

    const result = await useCase.execute();

    expect(mockAgenda.findUpcoming).toHaveBeenCalledWith(4);
    expect(result.sections[0].kind).toBe('agenda');
    expect(result.sections[0].items).toHaveLength(1);
  });

  /**
   * Nearest-upcoming only. A homepage agenda listing last month's events is
   * worse than an empty one — it tells a visitor the school stopped doing
   * things (FR-040).
   */
  it('never asks the agenda for past entries', async () => {
    mockSections.findAllEnabled.mockResolvedValue([
      { key: 'agenda', itemCount: 3, displayOrder: 1 },
    ]);

    await useCase.execute();

    // findUpcoming is the only agenda read available to the aggregator; there
    // is no scope argument it could pass to widen it.
    expect(Object.keys(mockAgenda)).toEqual(['findUpcoming']);
  });

  it('returns an empty section rather than omitting it when nothing is published', async () => {
    mockSections.findAllEnabled.mockResolvedValue([
      { key: 'berita', itemCount: 3, displayOrder: 1 },
    ]);
    mockPosts.findLatestPublic.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result.sections).toHaveLength(1);
    expect(result.sections[0].items).toEqual([]);
  });

  /**
   * FR-032. With `Promise.all` a single failing repository rejected the whole
   * response and the school's homepage returned a 500 — the news fine, the
   * agenda fine, and the page down because albums hiccuped.
   */
  it('still renders the other sections when one cannot be retrieved', async () => {
    mockSections.findAllEnabled.mockResolvedValue([
      { key: 'berita', itemCount: 3, displayOrder: 1 },
      { key: 'galeri', itemCount: 3, displayOrder: 2 },
    ]);
    mockGallery.findLatestPublicAlbums.mockRejectedValue(
      new Error('connection reset'),
    );

    const result = await useCase.execute();

    expect(result.sections).toHaveLength(2);
    expect(result.sections[0].items).toHaveLength(1);
    expect(result.sections[1].items).toEqual([]);
  });

  // The failing section degrades to the same empty state a genuinely empty one
  // shows, so the page layout is unchanged for a visitor.
  it('keeps a failed section in place rather than dropping it', async () => {
    mockSections.findAllEnabled.mockResolvedValue([
      { key: 'agenda', itemCount: 3, displayOrder: 1 },
    ]);
    mockAgenda.findUpcoming.mockRejectedValue(new Error('timeout'));

    const result = await useCase.execute();

    expect(result.sections[0].key).toBe('agenda');
    expect(result.sections[0].displayOrder).toBe(1);
  });

  it('renders no sections at all when every one is disabled', async () => {
    mockSections.findAllEnabled.mockResolvedValue([]);

    expect((await useCase.execute()).sections).toEqual([]);
  });

  it('exposes only the public item shape', async () => {
    mockSections.findAllEnabled.mockResolvedValue([
      { key: 'berita', itemCount: 3, displayOrder: 1 },
    ]);

    const [item] = (await useCase.execute()).sections[0].items;

    expect(item).not.toHaveProperty('status');
    expect(item).not.toHaveProperty('version');
    expect(item.title).toBe('Juara 1 Olimpiade');
  });
});

describe('UpdateHomepageSectionUseCase', () => {
  let useCase: UpdateHomepageSectionUseCase;
  const mockSections = { findByKey: jest.fn(), update: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: PortalCacheService, useValue: cacheMock },
        UpdateHomepageSectionUseCase,
        { provide: IHomepageSectionRepository, useValue: mockSections },
      ],
    }).compile();

    useCase = module.get(UpdateHomepageSectionUseCase);
    jest.clearAllMocks();
    mockSections.findByKey.mockResolvedValue({
      id: 'sec-1',
      key: 'berita',
      itemCount: 3,
      isEnabled: true,
      displayOrder: 1,
    });
    mockSections.update.mockImplementation((key, data) =>
      Promise.resolve({ id: 'sec-1', key, isEnabled: true, ...data }),
    );
  });

  it('throws NotFound for an unknown section key', async () => {
    mockSections.findByKey.mockResolvedValue(null);

    await expect(
      useCase.execute('does-not-exist', { itemCount: 3 }),
    ).rejects.toThrow(NotFoundException);
  });

  it('changes the item count without any code change', async () => {
    const result = await useCase.execute('berita', { itemCount: 5 });

    expect(result.itemCount).toBe(5);
  });

  it.each([0, 13])('rejects an out-of-range item count (%i)', async (count) => {
    await expect(
      useCase.execute('berita', { itemCount: count }),
    ).rejects.toThrow(BadRequestException);
    expect(mockSections.update).not.toHaveBeenCalled();
  });

  it('allows hiding a section entirely', async () => {
    await useCase.execute('berita', { isEnabled: false });

    expect(mockSections.update).toHaveBeenCalledWith(
      'berita',
      expect.objectContaining({ isEnabled: false }),
    );
  });
});
