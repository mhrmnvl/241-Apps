import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { HtmlSanitizerService } from '../../../shared/helpers/html-sanitizer.service.js';
import { ContentStatus } from '../domain/enums/content-status.enum.js';
import { PostType } from '../domain/enums/post-type.enum.js';
import { SyncMediaUsageUseCase } from '../../media/use-cases/sync-media-usage.use-case.js';
import { ITagRepository } from '../../taxonomy/domain/interfaces/tag-repository.interface.js';
import { IPostRepository } from '../domain/interfaces/post-repository.interface.js';
import { CreatePostDto } from '../dto/request/create-post.dto.js';
import { CreatePostUseCase } from './create-post.use-case.js';
import { PortalCacheService } from '../../shared/services/portal-cache.service.js';

const AUTHOR_ID = '11111111-1111-4111-8111-111111111111';

function repoRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'post-1',
    type: PostType.BERITA,
    title: 'Juara 1 Olimpiade Matematika',
    slug: 'juara-1-olimpiade-matematika',
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
    version: 0,
    createdAt: new Date('2026-08-06T00:00:00.000Z'),
    updatedAt: new Date('2026-08-06T00:00:00.000Z'),
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

describe('CreatePostUseCase', () => {
  let useCase: CreatePostUseCase;

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
    create: jest.fn(),
    findTakenSlugs: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: PortalCacheService, useValue: cacheMock },
        CreatePostUseCase,
        HtmlSanitizerService,
        { provide: ITagRepository, useValue: mockTagRepository },
        { provide: SyncMediaUsageUseCase, useValue: mockSyncMediaUsage },
        { provide: IPostRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get(CreatePostUseCase);
    jest.clearAllMocks();
    mockRepository.findTakenSlugs.mockResolvedValue([]);
    mockRepository.create.mockResolvedValue(repoRow());
  });

  const baseDto: CreatePostDto = {
    type: PostType.BERITA,
    title: 'Juara 1 Olimpiade Matematika',
    summary: 'Santri kelas VIII meraih juara 1.',
    body: '<p>Alhamdulillah</p>',
  };

  it('creates as a draft and never as published', async () => {
    await useCase.execute(baseDto, AUTHOR_ID);

    const written = mockRepository.create.mock.calls[0][0] as Record<
      string,
      unknown
    >;
    expect(written).not.toHaveProperty('status');
    expect(written).not.toHaveProperty('publishedAt');
    expect(written.authorId).toBe(AUTHOR_ID);
  });

  it('generates a slug from the title', async () => {
    await useCase.execute(baseDto, AUTHOR_ID);

    expect(mockRepository.create.mock.calls[0][0].slug).toBe(
      'juara-1-olimpiade-matematika',
    );
  });

  it('suffixes the slug when the title is already taken in that type', async () => {
    mockRepository.findTakenSlugs.mockResolvedValue([
      'juara-1-olimpiade-matematika',
    ]);

    await useCase.execute(baseDto, AUTHOR_ID);

    expect(mockRepository.create.mock.calls[0][0].slug).toBe(
      'juara-1-olimpiade-matematika-2',
    );
  });

  it('honours an editor-supplied slug', async () => {
    await useCase.execute({ ...baseDto, slug: 'juara-olimpiade' }, AUTHOR_ID);

    expect(mockRepository.create.mock.calls[0][0].slug).toBe('juara-olimpiade');
  });

  it('rejects a title that produces no usable address', async () => {
    await expect(
      useCase.execute({ ...baseDto, title: '!!!' }, AUTHOR_ID),
    ).rejects.toThrow(BadRequestException);
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  // The security-critical one. If sanitization moves to the read path or to the
  // editor, this fails.
  it('sanitizes the body before it reaches the repository', async () => {
    await useCase.execute(
      { ...baseDto, body: '<p>Halo</p><script>alert(1)</script>' },
      AUTHOR_ID,
    );

    const body = mockRepository.create.mock.calls[0][0].body as string;
    expect(body).not.toContain('script');
    expect(body).toContain('<p>Halo</p>');
  });

  it('maps field by field and does not forward unknown DTO keys', async () => {
    await useCase.execute(
      { ...baseDto, isAdmin: true } as CreatePostDto & { isAdmin: boolean },
      AUTHOR_ID,
    );

    expect(mockRepository.create.mock.calls[0][0]).not.toHaveProperty(
      'isAdmin',
    );
  });

  describe('type-specific fields', () => {
    it('accepts expiry and attachment on a Pengumuman', async () => {
      await useCase.execute(
        {
          ...baseDto,
          type: PostType.PENGUMUMAN,
          expiresAt: '2026-09-01T00:00:00.000Z',
        },
        AUTHOR_ID,
      );

      expect(mockRepository.create.mock.calls[0][0].expiresAt).toEqual(
        new Date('2026-09-01T00:00:00.000Z'),
      );
    });

    it.each([PostType.BERITA, PostType.ARTIKEL])(
      'rejects an expiry on a %s instead of ignoring it',
      async (type) => {
        await expect(
          useCase.execute(
            { ...baseDto, type, expiresAt: '2026-09-01T00:00:00.000Z' },
            AUTHOR_ID,
          ),
        ).rejects.toThrow(BadRequestException);
      },
    );

    it('rejects an attachment on a Berita', async () => {
      await expect(
        useCase.execute(
          {
            ...baseDto,
            attachmentFileId: '22222222-2222-4222-8222-222222222222',
          },
          AUTHOR_ID,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
