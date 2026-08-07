import { Module } from '@nestjs/common';
import { FileModule } from '../../platform/file/file.module.js';
import { IMediaUsageRepository } from './domain/interfaces/media-usage-repository.interface.js';
import { PrismaMediaUsageRepository } from './infrastructure/persistence/prisma-media-usage.repository.js';
import { MediaController } from './presentation/media.controller.js';
import { MediaPublicController } from './presentation/media-public.controller.js';
import { GetMediaLibraryUseCase } from './use-cases/get-media-library.use-case.js';
import { GetMediaUsageUseCase } from './use-cases/get-media-usage.use-case.js';
import { GetPublicMediaUseCase } from './use-cases/get-public-media.use-case.js';
import { SyncMediaUsageUseCase } from './use-cases/sync-media-usage.use-case.js';

@Module({
  // platform/file supplies IFileRepository. The Module class is imported
  // directly rather than through the feature barrel — a barrel also re-exports
  // the Module and use cases, and importing it from here would close an ESM
  // cycle that crashes boot.
  imports: [FileModule],
  controllers: [MediaController, MediaPublicController],
  providers: [
    { provide: IMediaUsageRepository, useClass: PrismaMediaUsageRepository },

    SyncMediaUsageUseCase,
    GetPublicMediaUseCase,
    GetMediaUsageUseCase,
    GetMediaLibraryUseCase,
  ],
  // Exported so every content module can record its references through the one
  // use case, rather than each writing portal_media_usages itself.
  exports: [SyncMediaUsageUseCase, IMediaUsageRepository],
})
export class MediaModule {}
