import { Module } from '@nestjs/common';
import { FileController } from './presentation/file.controller.js';
import { PrismaFileRepository } from './infrastructure/persistence/prisma-file.repository.js';
import { IFileRepository } from './domain/interfaces/file-repository.interface.js';
import { ImageOptimizerService } from './domain/interfaces/image-optimizer.interface.js';
import { SharpImageOptimizerService } from './infrastructure/image-optimizer.service.js';

// Use cases
import { UploadFileUseCase } from './use-cases/upload-file.use-case.js';
import { GetFilesUseCase } from './use-cases/get-files.use-case.js';
import { DeleteFileUseCase } from './use-cases/delete-file.use-case.js';

@Module({
  controllers: [FileController],
  providers: [
    {
      provide: IFileRepository,
      useClass: PrismaFileRepository,
    },
    {
      provide: ImageOptimizerService,
      useClass: SharpImageOptimizerService,
    },
    UploadFileUseCase,
    GetFilesUseCase,
    DeleteFileUseCase,
  ],
  exports: [IFileRepository, ImageOptimizerService],
})
export class FileModule {}
