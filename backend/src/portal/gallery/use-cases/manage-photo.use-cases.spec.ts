import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SyncMediaUsageUseCase } from '../../media/use-cases/sync-media-usage.use-case.js';
import { ContentStatus } from '../../post/domain/enums/content-status.enum.js';
import { IGalleryRepository } from '../domain/interfaces/gallery-repository.interface.js';
import {
  AddPhotoUseCase,
  RemovePhotoUseCase,
  ReorderPhotosUseCase,
  UpdatePhotoUseCase,
} from './manage-photo.use-cases.js';
import { PortalCacheService } from '../../shared/services/portal-cache.service.js';

const AUTHOR_ID = '11111111-1111-4111-8111-111111111111';
const FILE_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

/** The public response cache. Invalidation is fire-and-forget from the
 *  use case's point of view, so a no-op is the whole of it here. */
const cacheMock = { invalidate: jest.fn(), get: jest.fn(), set: jest.fn() };

const album = {
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
  version: 2,
  createdAt: new Date('2026-08-01T00:00:00.000Z'),
  updatedAt: new Date('2026-08-01T00:00:00.000Z'),
  deletedAt: null,
};

const repository = {
  findAlbumById: jest.fn(),
  updatePhoto: jest.fn(),
  findPhotoIds: jest.fn(),
  findPhotoFileIds: jest.fn(),
  addPhoto: jest.fn(),
  removePhoto: jest.fn(),
  reorderPhotos: jest.fn(),
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
  repository.findAlbumById.mockResolvedValue(album);
  repository.findPhotoIds.mockResolvedValue(['photo-1', 'photo-2']);
  repository.findPhotoFileIds.mockResolvedValue([FILE_ID]);
  repository.updatePhoto.mockResolvedValue({
    id: 'photo-1',
    albumId: 'album-1',
    fileId: FILE_ID,
    altText: 'Penampilan tari saman',
    caption: 'Kelas 9A membuka acara',
    displayOrder: 0,
  });
  repository.addPhoto.mockResolvedValue({
    id: 'photo-3',
    albumId: 'album-1',
    fileId: FILE_ID,
    altText: 'Penampilan tari saman',
    caption: null,
    displayOrder: 2,
  });
  syncMediaUsage.execute.mockResolvedValue(undefined);
});

describe('AddPhotoUseCase', () => {
  it('adds a photo with its alt text', async () => {
    const useCase = await build(AddPhotoUseCase);

    await useCase.execute('album-1', {
      fileId: FILE_ID,
      altText: 'Penampilan tari saman',
    });

    expect(repository.addPhoto).toHaveBeenCalledWith(
      expect.objectContaining({ altText: 'Penampilan tari saman' }),
    );
  });

  /**
   * FR-057. An alt of " " is worse than none: a screen reader announces
   * nothing and no accessibility tool flags it, so the page looks compliant and
   * is not.
   */
  it('refuses whitespace-only alt text', async () => {
    const useCase = await build(AddPhotoUseCase);

    await expect(
      useCase.execute('album-1', { fileId: FILE_ID, altText: '   ' }),
    ).rejects.toThrow(BadRequestException);
    expect(repository.addPhoto).not.toHaveBeenCalled();
  });

  it('trims the alt text it stores', async () => {
    const useCase = await build(AddPhotoUseCase);

    await useCase.execute('album-1', {
      fileId: FILE_ID,
      altText: '  Tari saman  ',
    });

    expect(repository.addPhoto).toHaveBeenCalledWith(
      expect.objectContaining({ altText: 'Tari saman' }),
    );
  });

  it('records the new photo as media usage', async () => {
    const useCase = await build(AddPhotoUseCase);

    await useCase.execute('album-1', {
      fileId: FILE_ID,
      altText: 'Tari saman',
    });

    expect(syncMediaUsage.execute).toHaveBeenCalledWith(
      expect.objectContaining({ column: 'albumId', ownerId: 'album-1' }),
    );
  });

  it('404s on an unknown album', async () => {
    const useCase = await build(AddPhotoUseCase);
    repository.findAlbumById.mockResolvedValue(null);

    await expect(
      useCase.execute('album-1', { fileId: FILE_ID, altText: 'Tari' }),
    ).rejects.toThrow(NotFoundException);
  });
});

describe('RemovePhotoUseCase', () => {
  it('removes the photo from its album', async () => {
    const useCase = await build(RemovePhotoUseCase);

    await useCase.execute('album-1', 'photo-1');

    expect(repository.removePhoto).toHaveBeenCalledWith('album-1', 'photo-1');
  });

  // The removed photo's usage row goes with it, so its file stops being
  // publicly fetchable even though the album itself is still published.
  it('recomputes media usage so the removed file stops being public', async () => {
    const useCase = await build(RemovePhotoUseCase);

    await useCase.execute('album-1', 'photo-1');

    expect(syncMediaUsage.execute).toHaveBeenCalled();
  });
});

describe('ReorderPhotosUseCase', () => {
  it('applies the order it was given', async () => {
    const useCase = await build(ReorderPhotosUseCase);

    await useCase.execute('album-1', { photoIds: ['photo-2', 'photo-1'] });

    expect(repository.reorderPhotos).toHaveBeenCalledWith('album-1', [
      'photo-2',
      'photo-1',
    ]);
  });

  it('refuses an order containing a photo the album does not hold', async () => {
    const useCase = await build(ReorderPhotosUseCase);

    await expect(
      useCase.execute('album-1', { photoIds: ['photo-1', 'photo-lain'] }),
    ).rejects.toThrow(BadRequestException);
    expect(repository.reorderPhotos).not.toHaveBeenCalled();
  });

  it('404s on an unknown album', async () => {
    const useCase = await build(ReorderPhotosUseCase);
    repository.findAlbumById.mockResolvedValue(null);

    await expect(useCase.execute('album-1', { photoIds: [] })).rejects.toThrow(
      NotFoundException,
    );
  });
});

/**
 * FR-048: "give each photo a caption". The schema stored one and the public
 * lightbox rendered one, but nothing collected it — the requirement was met
 * everywhere except where a person could act on it.
 */
describe('UpdatePhotoUseCase', () => {
  it('sets a caption on an existing photo', async () => {
    const useCase = await build(UpdatePhotoUseCase);

    await useCase.execute('album-1', 'photo-1', {
      caption: 'Kelas 9A membuka acara',
    });

    expect(repository.updatePhoto).toHaveBeenCalledWith('album-1', 'photo-1', {
      caption: 'Kelas 9A membuka acara',
    });
  });

  // Clearing is a real intent, distinct from "leave it alone" — so an empty
  // string becomes null rather than a blank caption rendered under the photo.
  it('clears a caption when given an empty one', async () => {
    const useCase = await build(UpdatePhotoUseCase);

    await useCase.execute('album-1', 'photo-1', { caption: '   ' });

    expect(repository.updatePhoto).toHaveBeenCalledWith('album-1', 'photo-1', {
      caption: null,
    });
  });

  it('leaves the caption alone when the field is absent', async () => {
    const useCase = await build(UpdatePhotoUseCase);

    await useCase.execute('album-1', 'photo-1', { altText: 'Tari saman' });

    expect(repository.updatePhoto).toHaveBeenCalledWith('album-1', 'photo-1', {
      altText: 'Tari saman',
    });
  });

  // Alt text may change but never be emptied — publishing already refuses a
  // photo without it, so allowing it here would only defer the failure.
  it('refuses to blank the alt text', async () => {
    const useCase = await build(UpdatePhotoUseCase);

    await expect(
      useCase.execute('album-1', 'photo-1', { altText: '  ' }),
    ).rejects.toThrow(BadRequestException);
    expect(repository.updatePhoto).not.toHaveBeenCalled();
  });

  // Scoped by album: a photoId from a different album must not be editable
  // through this album's endpoint.
  it('404s on a photo that is not in this album', async () => {
    const useCase = await build(UpdatePhotoUseCase);
    repository.updatePhoto.mockResolvedValue(null);

    await expect(
      useCase.execute('album-1', 'photo-lain', { caption: 'x' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('404s on an unknown album', async () => {
    const useCase = await build(UpdatePhotoUseCase);
    repository.findAlbumById.mockResolvedValue(null);

    await expect(
      useCase.execute('album-1', 'photo-1', { caption: 'x' }),
    ).rejects.toThrow(NotFoundException);
  });
});
