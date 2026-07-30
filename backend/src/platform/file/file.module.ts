import { Module } from '@nestjs/common';
import { FileController } from './presentation/file.controller.js';
import { FileRepository } from './repositories/file.repository.js';
import { ImageOptimizerService } from './domain/interfaces/image-optimizer.interface.js';
import { SharpImageOptimizerService } from './infrastructure/image-optimizer.service.js';

// Use cases
import { UploadFileUseCase } from './use-cases/upload-file.use-case.js';
import { GetFilesUseCase } from './use-cases/get-files.use-case.js';
import { DeleteFileUseCase } from './use-cases/delete-file.use-case.js';

@Module({
  controllers: [FileController],
  providers: [
    FileRepository,
    {
      provide: ImageOptimizerService,
      useClass: SharpImageOptimizerService,
    },
    UploadFileUseCase,
    GetFilesUseCase,
    DeleteFileUseCase,
  ],
  exports: [FileRepository, ImageOptimizerService],
})
export class FileModule {}
