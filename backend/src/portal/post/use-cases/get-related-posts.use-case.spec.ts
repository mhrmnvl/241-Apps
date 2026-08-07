import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ContentStatus } from '../domain/enums/content-status.enum.js';
import { PostType } from '../domain/enums/post-type.enum.js';
import { IPostRepository } from '../domain/interfaces/post-repository.interface.js';
import { GetRelatedPostsUseCase } from './get-related-posts.use-case.js';
import { PortalCacheService } from '../../shared/services/portal-cache.service.js';

const AUTHOR_ID = '11111111-1111-4111-8111-111111111111';
const CATEGORY_ID = '33333333-3333-4333-8333-333333333333';

function row(overrides: Record<string, unknown> = {}) {
  return {
    id: 'post-1',
    type: PostType.BERITA,
    title: 'Juara 1 Olimpiade',
    slug: 'juara-1-olimpiade',
    summary: 'Ringkasan',
    body: '<p>Isi</p>',
    coverFileId: null,
    coverAltText: null,
    categoryId: CATEGORY_ID,
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
    category: { id: CATEGORY_ID, name: 'Prestasi', slug: 'prestasi' },
    coverFile: null,
    attachment: null,
    ...overrides,
  };
}

/** The public response cache. Invalidation is fire-and-forget from the
 *  use case's point of view, so a no-op is the whole of it here. */
const cacheMock = { invalidate: jest.fn(), get: jest.fn(), set: jest.fn() };

describe('GetRelatedPostsUseCase', () => {
  let useCase: GetRelatedPostsUseCase;
  const mockRepository = {
    findPublicBySlug: jest.fn(),
    findRelated: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: PortalCacheService, useValue: cacheMock },
        GetRelatedPostsUseCase,
        { provide: IPostRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get(GetRelatedPostsUseCase);
    jest.clearAllMocks();
    mockRepository.findPublicBySlug.mockResolvedValue(row());
    mockRepository.findRelated.mockResolvedValue([]);
  });

  it('anchors on the item being read and never returns it', async () => {
    await useCase.execute(PostType.BERITA, 'juara-1-olimpiade');

    expect(mockRepository.findRelated).toHaveBeenCalledWith(
      expect.objectContaining({ excludeId: 'post-1' }),
    );
  });

  // FR-025: same category first, then recency.
  it('passes the anchor category through so the same-category pass runs first', async () => {
    await useCase.execute(PostType.BERITA, 'juara-1-olimpiade');

    expect(mockRepository.findRelated).toHaveBeenCalledWith(
      expect.objectContaining({ categoryId: CATEGORY_ID, take: 4 }),
    );
  });

  it('still asks for related items when the anchor has no category', async () => {
    mockRepository.findPublicBySlug.mockResolvedValue(
      row({ categoryId: null, category: null }),
    );

    await useCase.execute(PostType.BERITA, 'juara-1-olimpiade');

    expect(mockRepository.findRelated).toHaveBeenCalledWith(
      expect.objectContaining({ categoryId: null }),
    );
  });

  it('maps to the public summary shape, without status or version', async () => {
    mockRepository.findRelated.mockResolvedValue([row({ id: 'post-2' })]);

    const [item] = await useCase.execute(PostType.BERITA, 'juara-1-olimpiade');

    expect(item.id).toBe('post-2');
    expect(item).not.toHaveProperty('status');
    expect(item).not.toHaveProperty('version');
  });

  // An unpublished anchor must not have a related list either — the 404 is the
  // same one the detail page gives, so nothing distinguishes them (FR-026).
  it('404s on an anchor a visitor cannot see, without touching findRelated', async () => {
    mockRepository.findPublicBySlug.mockResolvedValue(null);

    await expect(
      useCase.execute(PostType.BERITA, 'masih-draft'),
    ).rejects.toThrow(NotFoundException);
    expect(mockRepository.findRelated).not.toHaveBeenCalled();
  });

  it('returns an empty list rather than failing when nothing matches', async () => {
    mockRepository.findRelated.mockResolvedValue([]);

    await expect(
      useCase.execute(PostType.BERITA, 'juara-1-olimpiade'),
    ).resolves.toEqual([]);
  });
});
