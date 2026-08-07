import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PaginatedResponse } from '../../../shared/domain/interfaces/repository.interface.js';
import { toSlug, toUniqueSlug } from '../../../shared/helpers/slug.helper.js';
import { SyncMediaUsageUseCase } from '../../media/use-cases/sync-media-usage.use-case.js';
import { ContentStatus } from '../../post/domain/enums/content-status.enum.js';
import {
  IGalleryRepository,
  UpdateAlbumInput,
} from '../domain/interfaces/gallery-repository.interface.js';
import {
  AlbumQueryDto,
  AlbumVersionDto,
  CreateAlbumDto,
  PublishAlbumDto,
  UpdateAlbumDto,
} from '../dto/request/gallery.dto.js';
import { toAdminAlbum } from '../infrastructure/mappers/gallery.mapper.js';
import { PortalCacheService } from '../../shared/services/portal-cache.service.js';

const CONFLICT_MESSAGE =
  'Album ini sudah diubah oleh pengguna lain. Muat ulang sebelum menyimpan.';

@Injectable()
export class GetAlbumsUseCase {
  constructor(private readonly galleryRepository: IGalleryRepository) {}

  async execute(query: AlbumQueryDto): Promise<PaginatedResponse<unknown>> {
    const { data, total, page, limit } =
      await this.galleryRepository.findAllAlbums(query);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}

@Injectable()
export class GetAlbumByIdUseCase {
  constructor(private readonly galleryRepository: IGalleryRepository) {}

  async execute(id: string) {
    const album = await this.galleryRepository.findAlbumById(id);
    if (!album || album.deletedAt) {
      throw new NotFoundException(`Album dengan ID ${id} tidak ditemukan`);
    }

    const photos = await this.galleryRepository.findPhotos(id, 1, 200);
    return { ...toAdminAlbum(album), photos: photos.data };
  }
}

@Injectable()
export class CreateAlbumUseCase {
  private readonly logger = new Logger(CreateAlbumUseCase.name);

  constructor(private readonly galleryRepository: IGalleryRepository) {}

  async execute(dto: CreateAlbumDto, authorId: string) {
    const base = toSlug(dto.slug ?? dto.title);
    if (base.length === 0) {
      throw new BadRequestException(
        'Judul tidak menghasilkan alamat yang valid.',
      );
    }
    const taken = await this.galleryRepository.findTakenSlugs(base);

    const album = await this.galleryRepository.createAlbum({
      title: dto.title,
      slug: toUniqueSlug(dto.slug ?? dto.title, taken),
      description: dto.description ?? null,
      eventDate: new Date(dto.eventDate),
      coverFileId: dto.coverFileId ?? null,
      authorId,
    });

    this.logger.log(`Album created as draft: "${album.title}"`);
    return toAdminAlbum(album);
  }
}

@Injectable()
export class UpdateAlbumUseCase {
  constructor(
    private readonly galleryRepository: IGalleryRepository,
    private readonly cache: PortalCacheService,
  ) {}

  async execute(id: string, dto: UpdateAlbumDto) {
    const existing = await this.galleryRepository.findAlbumById(id);
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Album dengan ID ${id} tidak ditemukan`);
    }

    const data: UpdateAlbumInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.eventDate !== undefined) data.eventDate = new Date(dto.eventDate);
    if (dto.coverFileId !== undefined) data.coverFileId = dto.coverFileId;
    if (dto.slug !== undefined && dto.slug !== existing.slug) {
      data.slug = toSlug(dto.slug);
    }

    const updated = await this.galleryRepository.updateAlbum(
      id,
      dto.version,
      data,
    );
    if (!updated) throw new ConflictException(CONFLICT_MESSAGE);

    // Only a published album can have a cached public copy to stale.
    if (updated.publishedAt !== null) await this.cache.invalidate();

    return toAdminAlbum(updated);
  }
}

@Injectable()
export class PublishAlbumUseCase {
  private readonly logger = new Logger(PublishAlbumUseCase.name);

  constructor(
    private readonly galleryRepository: IGalleryRepository,
    private readonly syncMediaUsage: SyncMediaUsageUseCase,
    private readonly cache: PortalCacheService,
  ) {}

  async execute(id: string, dto: PublishAlbumDto) {
    const existing = await this.galleryRepository.findAlbumById(id);
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Album dengan ID ${id} tidak ditemukan`);
    }

    // FR-051. An empty album on the public site is a link to nothing — and
    // unlike a missing cover, there is no partial version worth showing.
    const photoCount = await this.galleryRepository.countPhotos(id);
    if (photoCount === 0) {
      throw new UnprocessableEntityException({
        message: 'Album belum memiliki foto dan belum dapat diterbitkan.',
        missingFields: ['photos'],
      });
    }

    const now = new Date();
    const scheduledAt = dto.scheduledAt ? new Date(dto.scheduledAt) : null;
    if (scheduledAt && scheduledAt.getTime() <= now.getTime()) {
      throw new BadRequestException(
        'Jadwal terbit harus di masa depan. Kosongkan untuk menerbitkan sekarang.',
      );
    }

    const published = await this.galleryRepository.publishAlbum(
      id,
      dto.version,
      scheduledAt ? ContentStatus.SCHEDULED : ContentStatus.PUBLISHED,
      scheduledAt ?? now,
      scheduledAt,
    );
    if (!published) throw new ConflictException(CONFLICT_MESSAGE);

    await this.recordMedia(id, published.coverFileId);
    await this.cache.invalidate();

    this.logger.log(`Album published: "${published.title}"`);
    return toAdminAlbum(published);
  }

  /** Every photo becomes publicly fetchable exactly while the album is live. */
  private async recordMedia(albumId: string, coverFileId: string | null) {
    const fileIds = await this.galleryRepository.findPhotoFileIds(albumId);
    await this.syncMediaUsage.execute({
      column: 'albumId',
      ownerId: albumId,
      coverFileId,
      albumPhotoFileIds: fileIds,
    });
  }
}

@Injectable()
export class UnpublishAlbumUseCase {
  constructor(
    private readonly galleryRepository: IGalleryRepository,
    private readonly cache: PortalCacheService,
  ) {}

  async execute(id: string, dto: AlbumVersionDto) {
    const existing = await this.galleryRepository.findAlbumById(id);
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Album dengan ID ${id} tidak ditemukan`);
    }

    const updated = await this.galleryRepository.unpublishAlbum(
      id,
      dto.version,
    );
    if (!updated) throw new ConflictException(CONFLICT_MESSAGE);

    await this.cache.invalidate();

    // The usage rows stay: authorization is derived from the *owner's*
    // visibility, so unpublishing revokes every photo without deleting a thing
    // — and republishing restores them with no second action (research R2).
    return toAdminAlbum(updated);
  }
}

@Injectable()
export class DeleteAlbumUseCase {
  constructor(
    private readonly galleryRepository: IGalleryRepository,
    private readonly cache: PortalCacheService,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.galleryRepository.findAlbumById(id);
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Album dengan ID ${id} tidak ditemukan`);
    }
    await this.galleryRepository.softDeleteAlbum(id);
    await this.cache.invalidate();
  }
}
