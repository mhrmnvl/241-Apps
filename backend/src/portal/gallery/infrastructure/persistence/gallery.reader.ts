import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';
import {
  GalleryAlbumRow,
  GalleryAlbumWithCount,
  GalleryPhotoRow,
} from '../../domain/interfaces/gallery-repository.interface.js';
import { visibleAlbumWhere } from './gallery.where.js';

/**
 * The read queries, kept out of the repository class so that class stays a flat
 * contract-to-call map inside the 200-line budget (Constitution V).
 */

const WITH_PHOTO_COUNT = { _count: { select: { photos: true } } } as const;

type AlbumWithCountRow = GalleryAlbumRow & { _count: { photos: number } };

/** Albums carry their photo count everywhere they are listed, so the card can
 *  say "12 foto" without a second request per album. */
function withCount(row: AlbumWithCountRow): GalleryAlbumWithCount {
  const { _count, ...album } = row;
  return { ...album, photoCount: _count.photos };
}

async function paginateAlbums(
  prisma: PrismaService,
  where: Prisma.GalleryAlbumWhereInput,
  page: number,
  limit: number,
): Promise<PaginatedResult<GalleryAlbumWithCount>> {
  const [data, total] = await Promise.all([
    prisma.galleryAlbum.findMany({
      where,
      include: WITH_PHOTO_COUNT,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ eventDate: 'desc' }],
    }),
    prisma.galleryAlbum.count({ where }),
  ]);

  return { data: data.map(withCount), total, page, limit };
}

export function findAllAlbums(
  prisma: PrismaService,
  query: {
    page?: number;
    limit?: number;
    search?: string;
    includeDeleted?: boolean;
  },
): Promise<PaginatedResult<GalleryAlbumWithCount>> {
  const { page = 1, limit = 10 } = query;
  const where: Prisma.GalleryAlbumWhereInput = {
    ...(query.includeDeleted
      ? { deletedAt: { not: null } }
      : { deletedAt: null }),
    ...(query.search && {
      title: { contains: query.search, mode: 'insensitive' },
    }),
  };

  return paginateAlbums(prisma, where, page, limit);
}

export function findPublicAlbums(
  prisma: PrismaService,
  query: { page?: number; limit?: number },
  now: Date,
): Promise<PaginatedResult<GalleryAlbumWithCount>> {
  const { page = 1, limit = 10 } = query;
  return paginateAlbums(prisma, visibleAlbumWhere(now), page, limit);
}

export async function findLatestPublicAlbums(
  prisma: PrismaService,
  take: number,
  now: Date,
): Promise<GalleryAlbumWithCount[]> {
  const rows = await prisma.galleryAlbum.findMany({
    where: visibleAlbumWhere(now),
    include: WITH_PHOTO_COUNT,
    take,
    orderBy: [{ eventDate: 'desc' }],
  });
  return rows.map(withCount);
}

/** Photos are paginated so a 50-photo album loads progressively (FR-050). */
export async function findPhotos(
  prisma: PrismaService,
  albumId: string,
  page = 1,
  limit = 24,
): Promise<PaginatedResult<GalleryPhotoRow>> {
  const where = { albumId };

  const [data, total] = await Promise.all([
    prisma.galleryPhoto.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ displayOrder: 'asc' }],
    }),
    prisma.galleryPhoto.count({ where }),
  ]);

  return { data, total, page, limit };
}
