import { ContentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import {
  AddPhotoInput,
  CreateAlbumInput,
  GalleryPhotoRow,
  UpdateAlbumInput,
  UpdatePhotoInput,
} from '../../domain/interfaces/gallery-repository.interface.js';

/**
 * Input → Prisma payload, plus the photo writes. Kept out of the repository
 * class so that class stays a flat contract-to-call map, and so "which fields
 * can be written" is answerable by reading one short file (Constitution V).
 */

export function buildAlbumCreateData(
  input: CreateAlbumInput,
): Prisma.GalleryAlbumUncheckedCreateInput {
  return {
    title: input.title,
    slug: input.slug,
    description: input.description ?? null,
    eventDate: input.eventDate,
    coverFileId: input.coverFileId ?? null,
    authorId: input.authorId,
  };
}

/**
 * Only keys actually present are written, so a partial update cannot blank a
 * field the editor never touched. `version` increments here — that increment
 * paired with the `expectedVersion` match is the whole optimistic lock.
 */
export function buildAlbumUpdateData(
  input: UpdateAlbumInput,
): Prisma.GalleryAlbumUncheckedUpdateInput {
  const data: Prisma.GalleryAlbumUncheckedUpdateInput = {
    version: { increment: 1 },
  };

  if (input.title !== undefined) data.title = input.title;
  if (input.slug !== undefined) data.slug = input.slug;
  if (input.description !== undefined) data.description = input.description;
  if (input.eventDate !== undefined) data.eventDate = input.eventDate;
  if (input.coverFileId !== undefined) data.coverFileId = input.coverFileId;

  return data;
}

export function buildAlbumPublishData(
  status: `${ContentStatus}`,
  publishedAt: Date,
  scheduledAt: Date | null,
): Prisma.GalleryAlbumUncheckedUpdateInput {
  return { status, publishedAt, scheduledAt, version: { increment: 1 } };
}

export function buildAlbumUnpublishData(): Prisma.GalleryAlbumUncheckedUpdateInput {
  return {
    status: ContentStatus.DRAFT,
    publishedAt: null,
    scheduledAt: null,
    version: { increment: 1 },
  };
}

/**
 * Appended at the end: the current count is the next free position, and the
 * editor reorders afterwards if they want it elsewhere.
 */
export async function addAlbumPhoto(
  prisma: PrismaService,
  data: AddPhotoInput,
): Promise<GalleryPhotoRow> {
  const displayOrder = await prisma.galleryPhoto.count({
    where: { albumId: data.albumId },
  });

  return prisma.galleryPhoto.create({
    data: {
      albumId: data.albumId,
      fileId: data.fileId,
      altText: data.altText,
      caption: data.caption ?? null,
      displayOrder,
    },
  });
}

/**
 * Scoped by album as well as id, for the same reason `removeAlbumPhoto` is:
 * a photoId belonging to another album must not be reachable through this
 * album's endpoint. `updateMany` returns a count, which is how "not in this
 * album" becomes a 404 rather than a silent no-op.
 */
export async function updateAlbumPhoto(
  prisma: PrismaService,
  albumId: string,
  photoId: string,
  data: UpdatePhotoInput,
): Promise<GalleryPhotoRow | null> {
  const payload: Prisma.GalleryPhotoUncheckedUpdateInput = {};
  if (data.caption !== undefined) payload.caption = data.caption;
  if (data.altText !== undefined) payload.altText = data.altText;

  const { count } = await prisma.galleryPhoto.updateMany({
    where: { id: photoId, albumId },
    data: payload,
  });
  if (count === 0) return null;

  return prisma.galleryPhoto.findFirstOrThrow({ where: { id: photoId } });
}

/**
 * Scoped by album as well as id, so a photoId belonging to another album cannot
 * be deleted through this album's endpoint.
 */
export async function removeAlbumPhoto(
  prisma: PrismaService,
  albumId: string,
  photoId: string,
): Promise<void> {
  await prisma.galleryPhoto.deleteMany({ where: { id: photoId, albumId } });
}

/**
 * Position is the array index, so the client sends the order it rendered rather
 * than a set of numbers it had to compute. One transaction, because a
 * half-applied reorder leaves the album in an order nobody chose.
 */
export async function reorderAlbumPhotos(
  prisma: PrismaService,
  albumId: string,
  photoIds: string[],
): Promise<void> {
  await prisma.$transaction(
    photoIds.map((id, index) =>
      prisma.galleryPhoto.updateMany({
        where: { id, albumId },
        data: { displayOrder: index },
      }),
    ),
  );
}
