import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginatedResponse } from '../../../shared/domain/interfaces/repository.interface.js';
import { IGalleryRepository } from '../domain/interfaces/gallery-repository.interface.js';
import { PublicAlbumQueryDto } from '../dto/request/gallery.dto.js';
import {
  toPublicAlbumSummary,
  toPublicPhoto,
} from '../infrastructure/mappers/gallery.mapper.js';

@Injectable()
export class GetPublicAlbumsUseCase {
  constructor(private readonly galleryRepository: IGalleryRepository) {}

  async execute(
    query: PublicAlbumQueryDto,
  ): Promise<PaginatedResponse<unknown>> {
    const { data, total, page, limit } =
      await this.galleryRepository.findPublicAlbums({
        page: query.page,
        limit: query.limit,
      });

    return {
      data: data.map(toPublicAlbumSummary),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}

/**
 * One album, with its photos paginated.
 *
 * The pagination is the point (FR-050, SC-015): a 50-photo album delivered in
 * one response is several megabytes of markup before anything renders. The
 * first page arrives immediately and the client loads the rest as the visitor
 * scrolls, so the album is usable within seconds on a mobile connection.
 */
@Injectable()
export class GetPublicAlbumBySlugUseCase {
  constructor(private readonly galleryRepository: IGalleryRepository) {}

  async execute(slug: string, query: PublicAlbumQueryDto) {
    const album = await this.galleryRepository.findPublicAlbumBySlug(slug);
    if (!album) {
      throw new NotFoundException('Halaman tidak ditemukan');
    }

    const photos = await this.galleryRepository.findPhotos(
      album.id,
      query.page,
      query.limit,
    );

    return {
      ...toPublicAlbumSummary({ ...album, photoCount: photos.total }),
      photos: {
        data: photos.data.map(toPublicPhoto),
        meta: {
          page: photos.page,
          limit: photos.limit,
          total: photos.total,
          totalPages: Math.ceil(photos.total / photos.limit),
        },
      },
    };
  }
}
