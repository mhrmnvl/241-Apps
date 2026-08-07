import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SyncMediaUsageUseCase } from '../../media/use-cases/sync-media-usage.use-case.js';
import { ContentStatus } from '../../post/domain/enums/content-status.enum.js';
import { IGalleryRepository } from '../domain/interfaces/gallery-repository.interface.js';
import {
  CreateAlbumUseCase,
  DeleteAlbumUseCase,
  PublishAlbumUseCase,
  UnpublishAlbumUseCase,
  UpdateAlbumUseCase,
} from './manage-album.use-cases.js';
import { PortalCacheService } from '../../shared/services/portal-cache.service.js';

const AUTHOR_ID = '11111111-1111-4111-8111-111111111111';
const PHOTO_FILE = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

function album(overrides: Record<string, unknown> = {}) {
  return {
    id: 'album-1',
    title: 'Pentas Seni 2026',
    slug: 'pentas-seni-2026',
    description: null,
    eventDate: new Date('2026-12-20T00:00:00.000Z'),
    coverFileId: null,
    status: ContentStatus.DRAFT,
    publishedAt: null,
    scheduledAt: null,
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
  findAllAlbums: jest.fn(),
  findAlbumById: jest.fn(),
  findPublicAlbums: jest.fn(),
  findPublicAlbumBySlug: jest.fn(),
  findLatestPublicAlbums: jest.fn(),
  findTakenSlugs: jest.fn(),
  findPhotos: jest.fn(),
  countPhotos: jest.fn(),
  findPhotoIds: jest.fn(),
  findPhotoFileIds: jest.fn(),
  createAlbum: jest.fn(),
  updateAlbum: jest.fn(),
  publishAlbum: jest.fn(),
  unpublishAlbum: jest.fn(),
  softDeleteAlbum: jest.fn(),
  addPhoto: jest.fn(),
  removePhoto: jest.fn(),
  reorderPhotos: jest.fn(),
  findAllVisibleAlbums: jest.fn(),
};

const syncMediaUsage = { execute: jest.fn() };

async function build<T>(useCase: new (...args: never[]) => T): Promise<T> {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      { provide: PortalCacheService, useValue: cacheMock },
      useCase,
      { provide: IGalleryRepository, useValue: repository },
      { provide: SyncMediaUsageUseCase, useValue: syncMediaUsage },
    ],
  }).compile();
  return module.get(useCase);
}

beforeEach(() => {
  jest.clearAllMocks();
  repository.findAlbumById.mockResolvedValue(album());
  repository.findTakenSlugs.mockResolvedValue([]);
  repository.createAlbum.mockImplementation((data: Record<string, unknown>) =>
    Promise.resolve(album(data)),
  );
  repository.updateAlbum.mockResolvedValue(album({ version: 3 }));
  repository.publishAlbum.mockResolvedValue(
    album({ status: ContentStatus.PUBLISHED, version: 3 }),
  );
  repository.unpublishAlbum.mockResolvedValue(
    album({ status: ContentStatus.DRAFT, publishedAt: null, version: 3 }),
  );
  repository.countPhotos.mockResolvedValue(3);
  repository.findPhotoFileIds.mockResolvedValue([PHOTO_FILE]);
  syncMediaUsage.execute.mockResolvedValue(undefined);
});

describe('CreateAlbumUseCase', () => {
  it('creates a draft with a derived address', async () => {
    const useCase = await build(CreateAlbumUseCase);

    await useCase.execute(
      { title: 'Pentas Seni 2026', eventDate: '2026-12-20' },
      AUTHOR_ID,
    );

    expect(repository.createAlbum).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'pentas-seni-2026' }),
    );
  });

  it('refuses a title that produces no usable address', async () => {
    const useCase = await build(CreateAlbumUseCase);

    await expect(
      useCase.execute({ title: '###', eventDate: '2026-12-20' }, AUTHOR_ID),
    ).rejects.toThrow(BadRequestException);
  });
});

describe('UpdateAlbumUseCase', () => {
  it('refuses when someone else saved first', async () => {
    const useCase = await build(UpdateAlbumUseCase);
    repository.updateAlbum.mockResolvedValue(null);

    await expect(
      useCase.execute('album-1', { version: 1, title: 'X' }),
    ).rejects.toThrow(ConflictException);
  });

  it('retitling does not move the address', async () => {
    const useCase = await build(UpdateAlbumUseCase);

    await useCase.execute('album-1', { version: 2, title: 'Pentas Seni' });

    expect(repository.updateAlbum.mock.calls[0][2]).not.toHaveProperty('slug');
  });
});

describe('PublishAlbumUseCase', () => {
  it('publishes an album that has photos', async () => {
    const useCase = await build(PublishAlbumUseCase);

    const result = await useCase.execute('album-1', { version: 2 });

    expect(result.status).toBe(ContentStatus.PUBLISHED);
  });

  /**
   * FR-051. An empty album on the public site is a link to nothing — and unlike
   * a missing cover image, there is no partial version worth showing.
   */
  it('refuses an album with no photos', async () => {
    const useCase = await build(PublishAlbumUseCase);
    repository.countPhotos.mockResolvedValue(0);

    await expect(useCase.execute('album-1', { version: 2 })).rejects.toThrow(
      UnprocessableEntityException,
    );
    expect(repository.publishAlbum).not.toHaveBeenCalled();
  });

  it('names photos as what is missing, so the editor knows what to do', async () => {
    const useCase = await build(PublishAlbumUseCase);
    repository.countPhotos.mockResolvedValue(0);

    await expect(
      useCase.execute('album-1', { version: 2 }),
    ).rejects.toMatchObject({ response: { missingFields: ['photos'] } });
  });

  // Every photo becomes publicly fetchable exactly while the album is live —
  // derived from the album's visibility, never flagged per file (research R2).
  it('records every photo as media usage on publish', async () => {
    const useCase = await build(PublishAlbumUseCase);

    await useCase.execute('album-1', { version: 2 });

    expect(syncMediaUsage.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        column: 'albumId',
        ownerId: 'album-1',
        albumPhotoFileIds: [PHOTO_FILE],
      }),
    );
  });

  it('refuses a schedule in the past', async () => {
    const useCase = await build(PublishAlbumUseCase);

    await expect(
      useCase.execute('album-1', {
        version: 2,
        scheduledAt: '2020-01-01T00:00:00.000Z',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});

describe('UnpublishAlbumUseCase', () => {
  /**
   * The usage rows deliberately stay. Authorization is derived from the
   * *owner's* visibility, so unpublishing revokes every photo without deleting
   * anything — and republishing restores them with no second action.
   */
  it('leaves the media usage rows in place', async () => {
    const useCase = await build(UnpublishAlbumUseCase);

    await useCase.execute('album-1', { version: 2 });

    expect(syncMediaUsage.execute).not.toHaveBeenCalled();
  });

  it('clears the publication date', async () => {
    const useCase = await build(UnpublishAlbumUseCase);

    const result = await useCase.execute('album-1', { version: 2 });

    expect(result.publishedAt).toBeNull();
  });
});

describe('DeleteAlbumUseCase', () => {
  it('soft deletes', async () => {
    const useCase = await build(DeleteAlbumUseCase);

    await useCase.execute('album-1');

    expect(repository.softDeleteAlbum).toHaveBeenCalledWith('album-1');
  });

  it('404s rather than deleting twice', async () => {
    const useCase = await build(DeleteAlbumUseCase);
    repository.findAlbumById.mockResolvedValue(
      album({ deletedAt: new Date() }),
    );

    await expect(useCase.execute('album-1')).rejects.toThrow(NotFoundException);
  });
});
