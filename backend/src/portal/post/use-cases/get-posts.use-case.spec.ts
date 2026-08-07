import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ContentStatus } from '../domain/enums/content-status.enum.js';
import { PostType } from '../domain/enums/post-type.enum.js';
import { IPostRepository } from '../domain/interfaces/post-repository.interface.js';
import { GetPostByIdUseCase } from './get-post-by-id.use-case.js';
import { GetPostsUseCase } from './get-posts.use-case.js';
import { PortalCacheService } from '../../shared/services/portal-cache.service.js';

const AUTHOR_ID = '11111111-1111-4111-8111-111111111111';

function row(overrides: Record<string, unknown> = {}) {
  return {
    id: 'post-1',
    type: PostType.BERITA,
    title: 'Judul',
    slug: 'judul',
    summary: 'Ringkasan',
    body: '<p>Isi</p>',
    coverFileId: null,
    coverAltText: null,
    categoryId: null,
    status: ContentStatus.DRAFT,
    publishedAt: null,
    scheduledAt: null,
    expiresAt: null,
    attachmentFileId: null,
    pinnedAt: null,
    metaTitle: null,
    metaDescription: null,
    authorId: AUTHOR_ID,
    version: 2,
    createdAt: new Date('2026-08-01T00:00:00.000Z'),
    updatedAt: new Date('2026-08-02T00:00:00.000Z'),
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

describe('GetPostsUseCase', () => {
  let useCase: GetPostsUseCase;
  const mockRepository = { findAll: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: PortalCacheService, useValue: cacheMock },
        GetPostsUseCase,
        { provide: IPostRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get(GetPostsUseCase);
    jest.clearAllMocks();
    mockRepository.findAll.mockResolvedValue({
      data: [row()],
      total: 25,
      page: 2,
      limit: 10,
    });
  });

  it('derives totalPages for the envelope', async () => {
    const result = await useCase.execute({ page: 2, limit: 10 });

    expect(result.meta).toEqual({
      page: 2,
      limit: 10,
      total: 25,
      totalPages: 3,
    });
  });

  it('carries the management filters through to the repository', async () => {
    await useCase.execute({
      page: 1,
      limit: 10,
      type: PostType.ARTIKEL,
      status: ContentStatus.DRAFT,
      search: 'olimpiade',
      includeDeleted: true,
    });

    expect(mockRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        type: PostType.ARTIKEL,
        status: ContentStatus.DRAFT,
        search: 'olimpiade',
        includeDeleted: true,
      }),
    );
  });

  it('keeps the editorial state in the management shape', async () => {
    const [item] = (await useCase.execute({})).data;

    expect(item.status).toBe(ContentStatus.DRAFT);
    expect(item.version).toBe(2);
  });

  it('falls back to the default page size when none is given', async () => {
    await useCase.execute({});

    expect(mockRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 10 }),
    );
  });
});

describe('GetPostByIdUseCase', () => {
  let useCase: GetPostByIdUseCase;
  const mockRepository = { findById: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: PortalCacheService, useValue: cacheMock },
        GetPostByIdUseCase,
        { provide: IPostRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get(GetPostByIdUseCase);
    jest.clearAllMocks();
  });

  it('throws NotFound for an unknown id', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('missing')).rejects.toThrow(NotFoundException);
  });

  it('returns a soft-deleted item so the recycle bin can show it', async () => {
    mockRepository.findById.mockResolvedValue(
      row({ deletedAt: new Date('2026-08-05T00:00:00.000Z') }),
    );

    const result = await useCase.execute('post-1');

    expect(result.deletedAt).toEqual(new Date('2026-08-05T00:00:00.000Z'));
  });
});
