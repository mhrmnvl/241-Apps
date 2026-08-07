import { Injectable } from '@nestjs/common';
import { ContentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';
import {
  AddPhotoInput,
  CreateAlbumInput,
  GalleryAlbumRow,
  GalleryAlbumWithCount,
  GalleryPhotoRow,
  IGalleryRepository,
  UpdateAlbumInput,
  UpdatePhotoInput,
} from '../../domain/interfaces/gallery-repository.interface.js';
import {
  addAlbumPhoto,
  buildAlbumCreateData,
  buildAlbumPublishData,
  buildAlbumUnpublishData,
  buildAlbumUpdateData,
  removeAlbumPhoto,
  reorderAlbumPhotos,
  updateAlbumPhoto,
} from './gallery.writer.js';
import {
  findAllAlbums,
  findLatestPublicAlbums,
  findPhotos,
  findPublicAlbums,
} from './gallery.reader.js';
import { updateIfVersionMatches } from '../../../shared/persistence/optimistic-update.js';
import { visibleAlbumWhere } from './gallery.where.js';

/**
 * A flat contract-to-call map. Read composition lives in `gallery.reader.ts`
 * and the visibility predicate in `gallery.where.ts`, so this class answers only
 * "which call serves which contract method" (Constitution V).
 */
@Injectable()
export class PrismaGalleryRepository extends IGalleryRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAllAlbums(query: {
    page?: number;
    limit?: number;
    search?: string;
    includeDeleted?: boolean;
  }): Promise<PaginatedResult<GalleryAlbumWithCount>> {
    return findAllAlbums(this.prisma, query);
  }

  async findAlbumById(id: string): Promise<GalleryAlbumRow | null> {
    return this.prisma.galleryAlbum.findFirst({ where: { id } });
  }

  async findPublicAlbums(
    query: { page?: number; limit?: number },
    now: Date = new Date(),
  ): Promise<PaginatedResult<GalleryAlbumWithCount>> {
    return findPublicAlbums(this.prisma, query, now);
  }

  async findPublicAlbumBySlug(
    slug: string,
    now: Date = new Date(),
  ): Promise<GalleryAlbumRow | null> {
    return this.prisma.galleryAlbum.findFirst({
      where: { ...visibleAlbumWhere(now), slug },
    });
  }

  async findLatestPublicAlbums(
    take: number,
    now: Date = new Date(),
  ): Promise<GalleryAlbumWithCount[]> {
    return findLatestPublicAlbums(this.prisma, take, now);
  }

  async findTakenSlugs(prefix: string): Promise<string[]> {
    const rows = await this.prisma.galleryAlbum.findMany({
      where: { slug: { startsWith: prefix } },
      select: { slug: true },
    });
    return rows.map((row) => row.slug);
  }

  async findPhotos(
    albumId: string,
    page = 1,
    limit = 24,
  ): Promise<PaginatedResult<GalleryPhotoRow>> {
    return findPhotos(this.prisma, albumId, page, limit);
  }

  async countPhotos(albumId: string): Promise<number> {
    return this.prisma.galleryPhoto.count({ where: { albumId } });
  }

  async findPhotoIds(albumId: string): Promise<string[]> {
    const rows = await this.prisma.galleryPhoto.findMany({
      where: { albumId },
      select: { id: true },
      orderBy: { displayOrder: 'asc' },
    });
    return rows.map((row) => row.id);
  }

  async findPhotoFileIds(albumId: string): Promise<string[]> {
    const rows = await this.prisma.galleryPhoto.findMany({
      where: { albumId },
      select: { fileId: true },
    });
    return rows.map((row) => row.fileId);
  }

  async createAlbum(data: CreateAlbumInput): Promise<GalleryAlbumRow> {
    return this.prisma.galleryAlbum.create({
      data: buildAlbumCreateData(data),
    });
  }

  async updateAlbum(
    id: string,
    expectedVersion: number,
    data: UpdateAlbumInput,
  ) {
    return this.updateIfVersionMatches(
      id,
      expectedVersion,
      buildAlbumUpdateData(data),
    );
  }

  async publishAlbum(
    id: string,
    expectedVersion: number,
    status: `${ContentStatus}`,
    publishedAt: Date,
    scheduledAt: Date | null,
  ) {
    return this.updateIfVersionMatches(
      id,
      expectedVersion,
      buildAlbumPublishData(status, publishedAt, scheduledAt),
    );
  }

  async unpublishAlbum(id: string, expectedVersion: number) {
    return this.updateIfVersionMatches(
      id,
      expectedVersion,
      buildAlbumUnpublishData(),
    );
  }

  async softDeleteAlbum(id: string): Promise<void> {
    await this.prisma.galleryAlbum.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async addPhoto(data: AddPhotoInput): Promise<GalleryPhotoRow> {
    return addAlbumPhoto(this.prisma, data);
  }

  async updatePhoto(
    albumId: string,
    photoId: string,
    data: UpdatePhotoInput,
  ): Promise<GalleryPhotoRow | null> {
    return updateAlbumPhoto(this.prisma, albumId, photoId, data);
  }

  async removePhoto(albumId: string, photoId: string): Promise<void> {
    return removeAlbumPhoto(this.prisma, albumId, photoId);
  }

  async reorderPhotos(albumId: string, photoIds: string[]): Promise<void> {
    return reorderAlbumPhotos(this.prisma, albumId, photoIds);
  }

  async findAllVisibleAlbums(now: Date = new Date()) {
    return this.prisma.galleryAlbum.findMany({
      where: visibleAlbumWhere(now),
      select: { slug: true, updatedAt: true },
    });
  }

  private updateIfVersionMatches(
    id: string,
    expectedVersion: number,
    data: Prisma.GalleryAlbumUncheckedUpdateInput,
  ): Promise<GalleryAlbumRow | null> {
    return updateIfVersionMatches(
      () =>
        this.prisma.galleryAlbum.updateMany({
          where: { id, version: expectedVersion, deletedAt: null },
          data,
        }),
      () => this.prisma.galleryAlbum.findFirstOrThrow({ where: { id } }),
    );
  }
}
