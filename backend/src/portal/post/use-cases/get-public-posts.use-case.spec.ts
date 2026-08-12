import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ContentStatus } from '../domain/enums/content-status.enum.js';
import { PostType } from '../domain/enums/post-type.enum.js';
import { IPostRepository } from '../domain/interfaces/post-repository.interface.js';
import { GetPublicPostBySlugUseCase } from './get-public-post-by-slug.use-case.js';
import { GetPublicPostsUseCase } from './get-public-posts.use-case.js';
import { PortalCacheService } from '../../shared/services/portal-cache.service.js';

const AUTHOR_ID = '11111111-1111-4111-8111-111111111111';
const COVER_ID = '22222222-2222-4222-8222-222222222222';

function row(overrides: Record<string, unknown> = {}) {
  return {
    id: 'post-1',
    type: PostType.BERITA,
    title: 'Juara 1 Olimpiade',
    slug: 'juara-1-olimpiade',
    summary: 'Ringkasan',
    body: '<p>Isi</p>',
    coverFileId: COVER_ID,
    coverAltText: 'Penyerahan piala',
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

describe('GetPublicPostsUseCase', () => {
  let useCase: GetPublicPostsUseCase;
  const mockRepository = { findPublic: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: PortalCacheService, useValue: cacheMock },
        GetPublicPostsUseCase,
        { provide: IPostRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get(GetPublicPostsUseCase);
    jest.clearAllMocks();
    mockRepository.findPublic.mockResolvedValue({
      data: [row()],
      total: 1,
      page: 1,
      limit: 10,
    });
  });

  it('returns the paginated envelope the interceptor expects', async () => {
    const result = await useCase.execute({ type: PostType.BERITA });

    expect(result.meta).toEqual({
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    });
  });

  it('exposes only the public shape — no status, version, or authorId', async () => {
    const [item] = (await useCase.execute({ type: PostType.BERITA })).data;

    expect(item).not.toHaveProperty('status');
    expect(item).not.toHaveProperty('version');
    expect(item).not.toHaveProperty('authorId');
    expect(item).not.toHaveProperty('scheduledAt');
  });

  it('renders the cover as a stable public address, never a signed URL', async () => {
    const [item] = (await useCase.execute({ type: PostType.BERITA })).data;

    expect(item.coverImageUrl).toBe(`/portal/public/media/${COVER_ID}`);
  });

  it('flattens the byline and keeps it when the profile is missing', async () => {
    mockRepository.findPublic.mockResolvedValue({
      data: [row({ author: { id: AUTHOR_ID, identifier: 'humas' } })],
      total: 1,
      page: 1,
      limit: 10,
    });

    const [item] = (await useCase.execute({ type: PostType.BERITA })).data;
    expect(item.authorName).toBe('humas');
  });

  it('marks pinned items so the listing can lead with them', async () => {
    mockRepository.findPublic.mockResolvedValue({
      data: [row({ pinnedAt: new Date() })],
      total: 1,
      page: 1,
      limit: 10,
    });

    const [item] = (await useCase.execute({ type: PostType.BERITA })).data;
    expect(item.isPinned).toBe(true);
  });

  // FR-044: the active list hides expired announcements; the archive is a
  // deliberate second listing rather than a way to widen the current one.
  it('defaults announcements to the active scope', async () => {
    await useCase.execute({ type: PostType.PENGUMUMAN });

    expect(mockRepository.findPublic).toHaveBeenCalledWith(
      expect.objectContaining({ expiryScope: 'active' }),
    );
  });

  it('passes the archive scope through when asked', async () => {
    await useCase.execute({ type: PostType.PENGUMUMAN, scope: 'archive' });

    expect(mockRepository.findPublic).toHaveBeenCalledWith(
      expect.objectContaining({ expiryScope: 'archive' }),
    );
  });

  // Expiry is meaningless for a Berita, so the scope is simply carried and
  // ignored downstream rather than rejected — nothing a visitor can act on.
  it('still defaults the scope when listing news', async () => {
    await useCase.execute({ type: PostType.BERITA });

    expect(mockRepository.findPublic).toHaveBeenCalledWith(
      expect.objectContaining({ expiryScope: 'active' }),
    );
  });
});

describe('GetPublicPostBySlugUseCase', () => {
  let useCase: GetPublicPostBySlugUseCase;
  const mockRepository = {
    findPublicBySlug: jest.fn(),
    findByHistoricalSlug: jest.fn(),
  };

  /** The detail payload, for the cases that expect a hit rather than a move. */
  async function detail(slug: string) {
    const result = await useCase.execute(PostType.BERITA, slug);
    if (result.kind !== 'found')
      throw new Error(`expected a hit, got ${result.kind}`);
    return result.post;
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: PortalCacheService, useValue: cacheMock },
        GetPublicPostBySlugUseCase,
        { provide: IPostRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get(GetPublicPostBySlugUseCase);
    jest.clearAllMocks();
    mockRepository.findByHistoricalSlug.mockResolvedValue(null);
  });

  it('returns the full public detail for a visible item', async () => {
    mockRepository.findPublicBySlug.mockResolvedValue(row());

    const result = await detail('juara-1-olimpiade');

    expect(result.title).toBe('Juara 1 Olimpiade');
    expect(result.body).toBe('<p>Isi</p>');
  });

  // SC-004: a draft's address must be indistinguishable from one that never
  // existed, or the 404 becomes a way to enumerate unpublished work.
  it('gives an identical 404 whether the item is missing or merely unpublished', async () => {
    mockRepository.findPublicBySlug.mockResolvedValue(null);

    const attempts = ['never-existed', 'masih-draft'].map(async (slug) => {
      try {
        await useCase.execute(PostType.BERITA, slug);
        throw new Error('expected a rejection');
      } catch (error) {
        return (error as NotFoundException).message;
      }
    });

    const [missing, draft] = await Promise.all(attempts);
    expect(missing).toBe(draft);
    expect(missing).toBe('Page not found');
  });

  it('falls back to title and summary for the share metadata', async () => {
    mockRepository.findPublicBySlug.mockResolvedValue(row());

    const result = await detail('juara-1-olimpiade');

    expect(result.metaTitle).toBe('Juara 1 Olimpiade');
    expect(result.metaDescription).toBe('Ringkasan');
  });

  it('prefers explicit metadata when the editor set it', async () => {
    mockRepository.findPublicBySlug.mockResolvedValue(
      row({ metaTitle: 'Judul SEO', metaDescription: 'Deskripsi SEO' }),
    );

    const result = await detail('juara-1-olimpiade');

    expect(result.metaTitle).toBe('Judul SEO');
    expect(result.metaDescription).toBe('Deskripsi SEO');
  });
});
