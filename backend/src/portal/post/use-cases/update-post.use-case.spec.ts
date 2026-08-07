import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { HtmlSanitizerService } from '../../../shared/helpers/html-sanitizer.service.js';
import { ContentStatus } from '../domain/enums/content-status.enum.js';
import { PostType } from '../domain/enums/post-type.enum.js';
import { SyncMediaUsageUseCase } from '../../media/use-cases/sync-media-usage.use-case.js';
import { ITagRepository } from '../../taxonomy/domain/interfaces/tag-repository.interface.js';
import { IPostRepository } from '../domain/interfaces/post-repository.interface.js';
import { UpdatePostUseCase } from './update-post.use-case.js';
import { PortalCacheService } from '../../shared/services/portal-cache.service.js';

const AUTHOR_ID = '11111111-1111-4111-8111-111111111111';
const PUBLISHED_AT = new Date('2026-07-01T00:00:00.000Z');

function row(overrides: Record<string, unknown> = {}) {
  return {
    id: 'post-1',
    type: PostType.BERITA,
    title: 'Judul Lama',
    slug: 'judul-lama',
    summary: 'Ringkasan',
    body: '<p>Isi</p>',
    coverFileId: null,
    coverAltText: null,
    categoryId: null,
    status: ContentStatus.PUBLISHED,
    publishedAt: PUBLISHED_AT,
    scheduledAt: null,
    expiresAt: null,
    attachmentFileId: null,
    pinnedAt: null,
    metaTitle: null,
    metaDescription: null,
    authorId: AUTHOR_ID,
    version: 3,
    createdAt: PUBLISHED_AT,
    updatedAt: PUBLISHED_AT,
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

describe('UpdatePostUseCase', () => {
  let useCase: UpdatePostUseCase;

  // Tags are written through the taxonomy port, so the post use cases only
  // ever ask it to resolve names and attach the result.
  // Media usage is recomputed after every content write (research R2).
  const mockSyncMediaUsage = {
    execute: jest.fn().mockResolvedValue(undefined),
  };

  const mockTagRepository = {
    resolveOrCreate: jest.fn().mockResolvedValue([]),
    setPostTags: jest.fn().mockResolvedValue(undefined),
  };

  const mockRepository = {
    findById: jest.fn(),
    update: jest.fn(),
    recordSlugHistory: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: PortalCacheService, useValue: cacheMock },
        UpdatePostUseCase,
        HtmlSanitizerService,
        { provide: ITagRepository, useValue: mockTagRepository },
        { provide: SyncMediaUsageUseCase, useValue: mockSyncMediaUsage },
        { provide: IPostRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get(UpdatePostUseCase);
    jest.clearAllMocks();
    mockRepository.recordSlugHistory.mockResolvedValue(undefined);
    mockRepository.findById.mockResolvedValue(row());
    mockRepository.update.mockResolvedValue(row({ version: 4 }));
  });

  it('throws NotFound for an unknown id', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('missing', { version: 0, title: 'x' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('treats a soft-deleted item as missing', async () => {
    mockRepository.findById.mockResolvedValue(row({ deletedAt: new Date() }));

    await expect(
      useCase.execute('post-1', { version: 3, title: 'x' }),
    ).rejects.toThrow(NotFoundException);
  });

  // FR-013: the second editor must be told, not silently overwritten.
  it('raises 409 when the version no longer matches', async () => {
    mockRepository.update.mockResolvedValue(null);

    await expect(
      useCase.execute('post-1', { version: 2, title: 'Judul Baru' }),
    ).rejects.toThrow(ConflictException);
  });

  it('passes the expected version through to the repository', async () => {
    await useCase.execute('post-1', { version: 3, title: 'Judul Baru' });

    expect(mockRepository.update).toHaveBeenCalledWith(
      'post-1',
      3,
      expect.objectContaining({ title: 'Judul Baru' }),
    );
  });

  it('only writes fields the editor actually sent', async () => {
    await useCase.execute('post-1', { version: 3, title: 'Judul Baru' });

    const data = mockRepository.update.mock.calls[0][2] as Record<
      string,
      unknown
    >;
    expect(data).toEqual({ title: 'Judul Baru' });
    expect(data).not.toHaveProperty('summary');
    expect(data).not.toHaveProperty('body');
  });

  // FR-018: an edit must not move the original publication date.
  it('never writes publishedAt', async () => {
    await useCase.execute('post-1', {
      version: 3,
      title: 'Judul Baru',
      summary: 'Ringkasan baru',
    });

    expect(mockRepository.update.mock.calls[0][2]).not.toHaveProperty(
      'publishedAt',
    );
  });

  // FR-008: retitling a published item must not move its address.
  it('does not change the slug when only the title changes', async () => {
    await useCase.execute('post-1', { version: 3, title: 'Judul Baru' });

    expect(mockRepository.update.mock.calls[0][2]).not.toHaveProperty('slug');
  });

  it('changes the slug when the editor explicitly supplies a different one', async () => {
    await useCase.execute('post-1', { version: 3, slug: 'judul-baru' });

    expect(mockRepository.update.mock.calls[0][2].slug).toBe('judul-baru');
  });

  // FR-066: the old address keeps working, so a link already on WhatsApp or in
  // a search index redirects rather than 404s.
  it('records the old address when a published item is renamed', async () => {
    await useCase.execute('post-1', { version: 3, slug: 'judul-baru' });

    expect(mockRepository.recordSlugHistory).toHaveBeenCalledWith(
      'post-1',
      PostType.BERITA,
      'judul-lama',
    );
  });

  // Nobody could have linked to a draft's address, and recording it would take
  // that address out of circulation permanently for no benefit.
  it('does not record the old address of an item that was never published', async () => {
    mockRepository.findById.mockResolvedValue(
      row({ publishedAt: null, status: ContentStatus.DRAFT }),
    );

    await useCase.execute('post-1', { version: 3, slug: 'judul-baru' });

    expect(mockRepository.recordSlugHistory).not.toHaveBeenCalled();
  });

  it('ignores a slug identical to the current one', async () => {
    await useCase.execute('post-1', { version: 3, slug: 'judul-lama' });

    expect(mockRepository.update.mock.calls[0][2]).not.toHaveProperty('slug');
  });

  it('sanitizes an edited body', async () => {
    await useCase.execute('post-1', {
      version: 3,
      body: '<p>Baru</p><script>alert(1)</script>',
    });

    const body = mockRepository.update.mock.calls[0][2].body as string;
    expect(body).not.toContain('script');
    expect(body).toContain('<p>Baru</p>');
  });

  it('allows clearing an optional field explicitly', async () => {
    await useCase.execute('post-1', { version: 3, coverAltText: '' });

    expect(mockRepository.update.mock.calls[0][2].coverAltText).toBe('');
  });
});
