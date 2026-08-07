import { PUBLIC_MEDIA_PATH } from '../../../post/constants/post.constants.js';
import {
  GalleryAlbumRow,
  GalleryAlbumWithCount,
  GalleryPhotoRow,
} from '../../domain/interfaces/gallery-repository.interface.js';

/** Stable public address for a file, or null. Never a signed URL. */
function mediaUrl(fileId: string | null): string | null {
  return fileId ? `${PUBLIC_MEDIA_PATH}/${fileId}` : null;
}

export function toPublicAlbumSummary(album: GalleryAlbumWithCount) {
  return {
    id: album.id,
    title: album.title,
    slug: album.slug,
    description: album.description,
    eventDate: album.eventDate,
    coverImageUrl: mediaUrl(album.coverFileId),
    photoCount: album.photoCount,
    publishedAt: album.publishedAt!,
  };
}

export function toPublicPhoto(photo: GalleryPhotoRow) {
  return {
    id: photo.id,
    // The stable address, so a photo keeps working after the signed URL that
    // uploaded it has expired — and stops working the moment the album is
    // unpublished, with no separate revocation (research R2).
    imageUrl: `${PUBLIC_MEDIA_PATH}/${photo.fileId}`,
    caption: photo.caption,
    altText: photo.altText,
    displayOrder: photo.displayOrder,
  };
}

export function toAdminAlbum(album: GalleryAlbumRow) {
  return { ...album, coverImageUrl: mediaUrl(album.coverFileId) };
}

export function toAdminPhoto(photo: GalleryPhotoRow) {
  return { ...photo, imageUrl: `${PUBLIC_MEDIA_PATH}/${photo.fileId}` };
}
