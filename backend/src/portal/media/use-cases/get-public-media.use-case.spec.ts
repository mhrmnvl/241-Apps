import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from '../../../core/storage/storage.service.js';
import { IFileRepository } from '../../../platform/file/domain/interfaces/file-repository.interface.js';
import { IMediaUsageRepository } from '../domain/interfaces/media-usage-repository.interface.js';
import { GetPublicMediaUseCase } from './get-public-media.use-case.js';
import { PortalCacheService } from '../../shared/services/portal-cache.service.js';

const FILE_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

/** The public response cache. Invalidation is fire-and-forget from the
 *  use case's point of view, so a no-op is the whole of it here. */
const cacheMock = { invalidate: jest.fn(), get: jest.fn(), set: jest.fn() };

describe('GetPublicMediaUseCase', () => {
  let useCase: GetPublicMediaUseCase;
  const mediaUsage = { isPubliclyReferenced: jest.fn() };
  const files = { findById: jest.fn() };
  const storage = { getSignedUrl: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: PortalCacheService, useValue: cacheMock },
        GetPublicMediaUseCase,
        { provide: IMediaUsageRepository, useValue: mediaUsage },
        { provide: IFileRepository, useValue: files },
        { provide: StorageService, useValue: storage },
      ],
    }).compile();

    useCase = module.get(GetPublicMediaUseCase);
    jest.clearAllMocks();
    mediaUsage.isPubliclyReferenced.mockResolvedValue(true);
    files.findById.mockResolvedValue({
      id: FILE_ID,
      storageKey: 'portal/files/foto.webp',
    });
    storage.getSignedUrl.mockResolvedValue('https://s3.example/signed?exp=1');
  });

  it('mints a fresh signed URL for a file published content references', async () => {
    const url = await useCase.execute(FILE_ID);

    expect(storage.getSignedUrl).toHaveBeenCalledWith('portal/files/foto.webp');
    expect(url).toBe('https://s3.example/signed?exp=1');
  });

  /**
   * The whole authorization rule (research R2). Nothing is stored on the file
   * saying "public" — a file is public exactly while some visible content
   * references it, so unpublishing revokes its images with no second action.
   */
  it('refuses a file only a draft references', async () => {
    mediaUsage.isPubliclyReferenced.mockResolvedValue(false);

    await expect(useCase.execute(FILE_ID)).rejects.toThrow(NotFoundException);
    expect(storage.getSignedUrl).not.toHaveBeenCalled();
  });

  // 404 not 403: a 403 would confirm the file exists and is merely withheld,
  // which is a way to enumerate unpublished work by its images.
  it('gives the same 404 for an unreferenced file and one that does not exist', async () => {
    mediaUsage.isPubliclyReferenced.mockResolvedValue(false);
    const unreferenced = await useCase.execute(FILE_ID).catch((e) => e);

    mediaUsage.isPubliclyReferenced.mockResolvedValue(true);
    files.findById.mockResolvedValue(null);
    const missing = await useCase.execute(FILE_ID).catch((e) => e);

    expect(unreferenced).toBeInstanceOf(NotFoundException);
    expect(missing).toBeInstanceOf(NotFoundException);
    expect((unreferenced as Error).message).toBe((missing as Error).message);
  });

  // The file table belongs to platform/file; this module reads it through the
  // port and never touches `this.prisma.file` (Principle VI).
  it('reads the file through the platform port', async () => {
    await useCase.execute(FILE_ID);

    expect(files.findById).toHaveBeenCalledWith(FILE_ID);
  });
});
