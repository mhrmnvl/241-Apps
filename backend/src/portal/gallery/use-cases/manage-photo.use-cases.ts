import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SyncMediaUsageUseCase } from '../../media/use-cases/sync-media-usage.use-case.js';
import { IGalleryRepository } from '../domain/interfaces/gallery-repository.interface.js';
import {
  AddPhotoDto,
  ReorderPhotosDto,
  UpdatePhotoDto,
} from '../dto/request/gallery.dto.js';
import { toAdminPhoto } from '../infrastructure/mappers/gallery.mapper.js';
import { PortalCacheService } from '../../shared/services/portal-cache.service.js';

/**
 * Photo operations, all of which end by recomputing the album's media usage.
 *
 * Recomputed rather than incrementally maintained for the same reason a post's
 * is: the set is small, and one recompute is easier to reason about than three
 * separate add/remove/reorder paths that each have to stay correct.
 */
@Injectable()
export class AddPhotoUseCase {
  private readonly logger = new Logger(AddPhotoUseCase.name);

  constructor(
    private readonly galleryRepository: IGalleryRepository,
    private readonly syncMediaUsage: SyncMediaUsageUseCase,
    private readonly cache: PortalCacheService,
  ) {}

  async execute(albumId: string, dto: AddPhotoDto) {
    const album = await this.assertAlbum(albumId);

    // Alt text is required by the DTO, but a whitespace-only value would pass
    // @IsNotEmpty on some inputs — and an alt of " " is worse than none,
    // because a screen reader announces nothing and no tooling flags it.
    if (!dto.altText.trim()) {
      throw new BadRequestException('Alt text is required');
    }

    const photo = await this.galleryRepository.addPhoto({
      albumId,
      fileId: dto.fileId,
      altText: dto.altText.trim(),
      caption: dto.caption ?? null,
    });

    await syncAlbumMedia(
      this.galleryRepository,
      this.syncMediaUsage,
      albumId,
      album.coverFileId,
    );

    if (album.publishedAt !== null) await this.cache.invalidate();

    this.logger.log(`Photo added to album "${album.title}"`);
    return toAdminPhoto(photo);
  }

  private async assertAlbum(albumId: string) {
    const album = await this.galleryRepository.findAlbumById(albumId);
    if (!album || album.deletedAt) {
      throw new NotFoundException(`Album ${albumId} not found`);
    }
    return album;
  }
}

/**
 * Edits a photo's caption or alt text (FR-048).
 *
 * No media-usage recompute and no cache flush beyond the album's own: the file
 * a photo points at has not changed, only the words around it — and the album's
 * public page is what carries them.
 */
@Injectable()
export class UpdatePhotoUseCase {
  constructor(
    private readonly galleryRepository: IGalleryRepository,
    private readonly cache: PortalCacheService,
  ) {}

  async execute(albumId: string, photoId: string, dto: UpdatePhotoDto) {
    const album = await this.galleryRepository.findAlbumById(albumId);
    if (!album || album.deletedAt) {
      throw new NotFoundException(`Album ${albumId} not found`);
    }

    // Alt text may be changed but never cleared — a photo without it is
    // unusable with a screen reader, and publishing already refuses one
    // (FR-057).
    if (dto.altText !== undefined && !dto.altText.trim()) {
      throw new BadRequestException('Alt text is required');
    }

    const photo = await this.galleryRepository.updatePhoto(albumId, photoId, {
      ...(dto.caption !== undefined
        ? { caption: dto.caption?.trim() ? dto.caption.trim() : null }
        : {}),
      ...(dto.altText !== undefined ? { altText: dto.altText.trim() } : {}),
    });

    if (!photo) {
      throw new NotFoundException(
        `Photo ${photoId} does not belong to this album`,
      );
    }

    if (album.publishedAt !== null) await this.cache.invalidate();

    return toAdminPhoto(photo);
  }
}

@Injectable()
export class RemovePhotoUseCase {
  constructor(
    private readonly galleryRepository: IGalleryRepository,
    private readonly syncMediaUsage: SyncMediaUsageUseCase,
    private readonly cache: PortalCacheService,
  ) {}

  async execute(albumId: string, photoId: string): Promise<void> {
    const album = await this.galleryRepository.findAlbumById(albumId);
    if (!album || album.deletedAt) {
      throw new NotFoundException(`Album ${albumId} not found`);
    }

    await this.galleryRepository.removePhoto(albumId, photoId);

    // The removed photo's usage row goes with it, so its file stops being
    // publicly fetchable even though the album is still published.
    await syncAlbumMedia(
      this.galleryRepository,
      this.syncMediaUsage,
      albumId,
      album.coverFileId,
    );

    if (album.publishedAt !== null) await this.cache.invalidate();
  }
}

@Injectable()
export class ReorderPhotosUseCase {
  constructor(
    private readonly galleryRepository: IGalleryRepository,
    private readonly cache: PortalCacheService,
  ) {}

  async execute(albumId: string, dto: ReorderPhotosDto): Promise<void> {
    const album = await this.galleryRepository.findAlbumById(albumId);
    if (!album || album.deletedAt) {
      throw new NotFoundException(`Album ${albumId} not found`);
    }

    // A stale client list would reorder around a photo that no longer exists,
    // producing an order nobody chose.
    const known = new Set(await this.galleryRepository.findPhotoIds(albumId));
    const unknown = dto.photoIds.filter((id) => !known.has(id));
    if (unknown.length > 0) {
      throw new BadRequestException(
        'The order references a photo that is not in this album. Reload the album.',
      );
    }

    await this.galleryRepository.reorderPhotos(albumId, dto.photoIds);

    if (album.publishedAt !== null) await this.cache.invalidate();
  }
}

/** Shared tail: the album's usage rows always describe its current contents. */
async function syncAlbumMedia(
  repository: IGalleryRepository,
  syncMediaUsage: SyncMediaUsageUseCase,
  albumId: string,
  coverFileId: string | null,
): Promise<void> {
  const fileIds = await repository.findPhotoFileIds(albumId);
  await syncMediaUsage.execute({
    column: 'albumId',
    ownerId: albumId,
    coverFileId,
    albumPhotoFileIds: fileIds,
  });
}
