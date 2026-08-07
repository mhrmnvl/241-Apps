import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { HtmlSanitizerService } from '../../../shared/helpers/html-sanitizer.service.js';
import { SyncMediaUsageUseCase } from '../../media/use-cases/sync-media-usage.use-case.js';
import { ContentStatus } from '../../post/domain/enums/content-status.enum.js';
import { IPageRepository } from '../domain/interfaces/page-repository.interface.js';
import {
  CreatePageUseCase,
  DeletePageUseCase,
  PublishPageUseCase,
  UnpublishPageUseCase,
  UpdatePageUseCase,
} from './manage-page.use-cases.js';
import { PortalCacheService } from '../../shared/services/portal-cache.service.js';

const AUTHOR_ID = '11111111-1111-4111-8111-111111111111';

function page(overrides: Record<string, unknown> = {}) {
  return {
    id: 'page-1',
    title: 'Visi & Misi',
    slug: 'visi-misi',
    body: '<p>Isi halaman</p>',
    metaTitle: null,
    metaDescription: null,
    status: ContentStatus.PUBLISHED,
    publishedAt: new Date('2026-08-01T00:00:00.000Z'),
    authorId: AUTHOR_ID,
    version: 2,
    createdAt: new Date('2026-08-01T00:00:00.000Z'),
    updatedAt: new Date('2026-08-01T00:00:00.000Z'),
    deletedAt: null,
    ...overrides,
  };
}

/** The public response cache. Invalidation is fire-and-forget from the
 *  use case's point of view, so a no-op is the whole of it here. */
const cacheMock = { invalidate: jest.fn(), get: jest.fn(), set: jest.fn() };

const repository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findPublicBySlug: jest.fn(),
  findByHistoricalSlug: jest.fn(),
  recordSlugHistory: jest.fn(),
  findTakenSlugs: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  publish: jest.fn(),
  unpublish: jest.fn(),
  softDelete: jest.fn(),
  findAllVisible: jest.fn(),
};

const syncMediaUsage = { execute: jest.fn() };

async function build<T>(useCase: new (...args: never[]) => T): Promise<T> {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      { provide: PortalCacheService, useValue: cacheMock },
      useCase,
      HtmlSanitizerService,
      { provide: IPageRepository, useValue: repository },
      { provide: SyncMediaUsageUseCase, useValue: syncMediaUsage },
    ],
  }).compile();
  return module.get(useCase);
}

beforeEach(() => {
  jest.clearAllMocks();
  repository.findById.mockResolvedValue(page());
  repository.findTakenSlugs.mockResolvedValue([]);
  repository.create.mockImplementation((data: Record<string, unknown>) =>
    Promise.resolve(page(data)),
  );
  repository.update.mockResolvedValue(page({ version: 3 }));
  repository.publish.mockResolvedValue(page({ version: 3 }));
  repository.unpublish.mockResolvedValue(
    page({ status: ContentStatus.DRAFT, publishedAt: null, version: 3 }),
  );
  repository.recordSlugHistory.mockResolvedValue(undefined);
  syncMediaUsage.execute.mockResolvedValue(undefined);
});

describe('CreatePageUseCase', () => {
  it('derives the address from the title', async () => {
    const useCase = await build(CreatePageUseCase);

    await useCase.execute(
      { title: 'Visi & Misi', body: '<p>Isi</p>' },
      AUTHOR_ID,
    );

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'visi-misi' }),
    );
  });

  // The API is the trust boundary, not the editor — a caller can POST straight
  // past the rich-text component.
  it('sanitizes the body on write', async () => {
    const useCase = await build(CreatePageUseCase);

    await useCase.execute(
      { title: 'Profil', body: '<p>Isi</p><script>alert(1)</script>' },
      AUTHOR_ID,
    );

    const created = repository.create.mock.calls[0][0] as { body: string };
    expect(created.body).not.toContain('<script>');
  });

  it('records the images the page introduces', async () => {
    const useCase = await build(CreatePageUseCase);

    await useCase.execute({ title: 'Profil', body: '<p>Isi</p>' }, AUTHOR_ID);

    expect(syncMediaUsage.execute).toHaveBeenCalledWith(
      expect.objectContaining({ column: 'pageId' }),
    );
  });

  it('refuses a title that produces no usable address', async () => {
    const useCase = await build(CreatePageUseCase);

    await expect(
      useCase.execute({ title: '###', body: '<p>Isi</p>' }, AUTHOR_ID),
    ).rejects.toThrow(BadRequestException);
  });
});

describe('UpdatePageUseCase', () => {
  // FR-054: "Profil" is linked from printed material as much as from the menu.
  it('retitling does not move the address', async () => {
    const useCase = await build(UpdatePageUseCase);

    await useCase.execute('page-1', { version: 2, title: 'Profil Madrasah' });

    expect(repository.update.mock.calls[0][2]).not.toHaveProperty('slug');
  });

  it('records the old address when a published page is moved', async () => {
    const useCase = await build(UpdatePageUseCase);

    await useCase.execute('page-1', { version: 2, slug: 'profil' });

    expect(repository.recordSlugHistory).toHaveBeenCalledWith(
      'page-1',
      'visi-misi',
    );
  });

  it('does not record the old address of a page never published', async () => {
    const useCase = await build(UpdatePageUseCase);
    repository.findById.mockResolvedValue(
      page({ publishedAt: null, status: ContentStatus.DRAFT }),
    );

    await useCase.execute('page-1', { version: 2, slug: 'profil' });

    expect(repository.recordSlugHistory).not.toHaveBeenCalled();
  });

  it('refuses when someone else saved first', async () => {
    const useCase = await build(UpdatePageUseCase);
    repository.update.mockResolvedValue(null);

    await expect(
      useCase.execute('page-1', { version: 1, title: 'X' }),
    ).rejects.toThrow(ConflictException);
  });
});

describe('PublishPageUseCase', () => {
  it('publishes a page with a title and a body', async () => {
    const useCase = await build(PublishPageUseCase);

    await useCase.execute('page-1', { version: 2 });

    expect(repository.publish).toHaveBeenCalled();
  });

  // A page has no category, cover, or feed placement to be missing — the
  // publish gate is correspondingly smaller than a post's (FR-052).
  it('refuses an empty page', async () => {
    const useCase = await build(PublishPageUseCase);
    repository.findById.mockResolvedValue(page({ body: '   ' }));

    await expect(useCase.execute('page-1', { version: 2 })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('404s on an unknown id', async () => {
    const useCase = await build(PublishPageUseCase);
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('page-1', { version: 2 })).rejects.toThrow(
      NotFoundException,
    );
  });
});

describe('UnpublishPageUseCase', () => {
  it('takes the page off the site and clears its publication date', async () => {
    const useCase = await build(UnpublishPageUseCase);

    const result = await useCase.execute('page-1', { version: 2 });

    expect(result.status).toBe(ContentStatus.DRAFT);
    expect(result.publishedAt).toBeNull();
  });
});

describe('DeletePageUseCase', () => {
  it('soft deletes', async () => {
    const useCase = await build(DeletePageUseCase);

    await useCase.execute('page-1');

    expect(repository.softDelete).toHaveBeenCalledWith('page-1');
  });

  it('404s rather than deleting twice', async () => {
    const useCase = await build(DeletePageUseCase);
    repository.findById.mockResolvedValue(page({ deletedAt: new Date() }));

    await expect(useCase.execute('page-1')).rejects.toThrow(NotFoundException);
  });
});
