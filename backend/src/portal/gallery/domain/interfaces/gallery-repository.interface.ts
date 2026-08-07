import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';
import { ContentStatus } from '../../../post/domain/enums/content-status.enum.js';

export interface GalleryPhotoRow {
  id: string;
  albumId: string;
  fileId: string;
  caption: string | null;
  altText: string;
  displayOrder: number;
}

export interface GalleryAlbumRow {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  eventDate: Date;
  coverFileId: string | null;
  status: `${ContentStatus}`;
  publishedAt: Date | null;
  scheduledAt: Date | null;
  authorId: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface GalleryAlbumWithCount extends GalleryAlbumRow {
  photoCount: number;
}

export interface CreateAlbumInput {
  title: string;
  slug: string;
  description?: string | null;
  eventDate: Date;
  coverFileId?: string | null;
  authorId: string;
}

export interface UpdateAlbumInput {
  title?: string;
  slug?: string;
  description?: string | null;
  eventDate?: Date;
  coverFileId?: string | null;
}

export interface AddPhotoInput {
  albumId: string;
  fileId: string;
  altText: string;
  caption?: string | null;
}

/** Caption and alt text are the only editable parts of a photo; the file itself
 *  is replaced by removing and re-adding. */
export interface UpdatePhotoInput {
  caption?: string | null;
  altText?: string;
}

export abstract class IGalleryRepository {
  abstract findAllAlbums(query: {
    page?: number;
    limit?: number;
    search?: string;
    includeDeleted?: boolean;
  }): Promise<PaginatedResult<GalleryAlbumWithCount>>;

  abstract findAlbumById(id: string): Promise<GalleryAlbumRow | null>;

  abstract findPublicAlbums(
    query: { page?: number; limit?: number },
    now?: Date,
  ): Promise<PaginatedResult<GalleryAlbumWithCount>>;

  abstract findPublicAlbumBySlug(
    slug: string,
    now?: Date,
  ): Promise<GalleryAlbumRow | null>;

  /** Newest-by-event-date albums, for the homepage section. */
  abstract findLatestPublicAlbums(
    take: number,
    now?: Date,
  ): Promise<GalleryAlbumWithCount[]>;

  abstract findTakenSlugs(prefix: string): Promise<string[]>;

  /** Photos are paginated so a 50-photo album loads progressively (FR-050). */
  abstract findPhotos(
    albumId: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<GalleryPhotoRow>>;

  abstract countPhotos(albumId: string): Promise<number>;

  abstract findPhotoIds(albumId: string): Promise<string[]>;

  /** Every file the album references, for the media-usage recompute. */
  abstract findPhotoFileIds(albumId: string): Promise<string[]>;

  abstract createAlbum(data: CreateAlbumInput): Promise<GalleryAlbumRow>;

  abstract updateAlbum(
    id: string,
    expectedVersion: number,
    data: UpdateAlbumInput,
  ): Promise<GalleryAlbumRow | null>;

  abstract publishAlbum(
    id: string,
    expectedVersion: number,
    status: `${ContentStatus}`,
    publishedAt: Date,
    scheduledAt: Date | null,
  ): Promise<GalleryAlbumRow | null>;

  abstract unpublishAlbum(
    id: string,
    expectedVersion: number,
  ): Promise<GalleryAlbumRow | null>;

  abstract softDeleteAlbum(id: string): Promise<void>;

  abstract addPhoto(data: AddPhotoInput): Promise<GalleryPhotoRow>;

  abstract updatePhoto(
    albumId: string,
    photoId: string,
    data: UpdatePhotoInput,
  ): Promise<GalleryPhotoRow | null>;

  abstract removePhoto(albumId: string, photoId: string): Promise<void>;

  abstract reorderPhotos(albumId: string, photoIds: string[]): Promise<void>;

  abstract findAllVisibleAlbums(
    now?: Date,
  ): Promise<{ slug: string; updatedAt: Date }[]>;
}
