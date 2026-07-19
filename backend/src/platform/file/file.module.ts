import { Module } from '@nestjs/common';
import { FileController } from './controllers/file.controller.js';
import { FileRepository } from './repositories/file.repository.js';

// Use cases
import { UploadFileUseCase } from './use-cases/upload-file.use-case.js';
import { GetFilesUseCase } from './use-cases/get-files.use-case.js';
import { DeleteFileUseCase } from './use-cases/delete-file.use-case.js';

@Module({
  controllers: [FileController],
  providers: [
    FileRepository,
    UploadFileUseCase,
    GetFilesUseCase,
    DeleteFileUseCase,
  ],
  exports: [FileRepository],
})
export class FileModule {}
