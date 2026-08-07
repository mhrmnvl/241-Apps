import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module.js';
import { IGalleryRepository } from './domain/interfaces/gallery-repository.interface.js';
import { PrismaGalleryRepository } from './infrastructure/persistence/prisma-gallery.repository.js';
import { GalleryController } from './presentation/gallery.controller.js';
import { GalleryPublicController } from './presentation/gallery-public.controller.js';
import {
  GetPublicAlbumBySlugUseCase,
  GetPublicAlbumsUseCase,
} from './use-cases/get-public-album.use-case.js';
import {
  CreateAlbumUseCase,
  DeleteAlbumUseCase,
  GetAlbumByIdUseCase,
  GetAlbumsUseCase,
  PublishAlbumUseCase,
  UnpublishAlbumUseCase,
  UpdateAlbumUseCase,
} from './use-cases/manage-album.use-cases.js';
import {
  AddPhotoUseCase,
  RemovePhotoUseCase,
  ReorderPhotosUseCase,
  UpdatePhotoUseCase,
} from './use-cases/manage-photo.use-cases.js';

@Module({
  imports: [MediaModule],
  controllers: [GalleryController, GalleryPublicController],
  providers: [
    { provide: IGalleryRepository, useClass: PrismaGalleryRepository },

    GetAlbumsUseCase,
    GetAlbumByIdUseCase,
    CreateAlbumUseCase,
    UpdateAlbumUseCase,
    PublishAlbumUseCase,
    UnpublishAlbumUseCase,
    DeleteAlbumUseCase,
    AddPhotoUseCase,
    UpdatePhotoUseCase,
    RemovePhotoUseCase,
    ReorderPhotosUseCase,
    GetPublicAlbumsUseCase,
    GetPublicAlbumBySlugUseCase,
  ],
  // Exported so the homepage aggregator can borrow albums through the port
  // rather than querying portal_gallery_albums itself (Principle VI).
  exports: [IGalleryRepository],
})
export class GalleryModule {}
