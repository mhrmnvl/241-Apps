// Public API of the gallery module. The Module class and DTOs are imported
// directly by consumers — a DTO importing this barrel would close an ESM cycle
// and crash boot (NESTJS-RULES.md).
export { IGalleryRepository } from './domain/interfaces/gallery-repository.interface.js';
export {
  toPublicAlbumSummary,
  toPublicPhoto,
} from './infrastructure/mappers/gallery.mapper.js';
export type {
  GalleryAlbumRow,
  GalleryAlbumWithCount,
  GalleryPhotoRow,
} from './domain/interfaces/gallery-repository.interface.js';
