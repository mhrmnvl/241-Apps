import { Injectable } from '@nestjs/common';
import { IFileRepository } from '../domain/interfaces/file-repository.interface.js';
import { StorageService } from '../../../core/storage/storage.service.js';

@Injectable()
export class GetFilesUseCase {
  constructor(
    private readonly fileRepository: IFileRepository,
    private readonly storage: StorageService,
  ) {}

  async execute() {
    const files = await this.fileRepository.findMany();
    return Promise.all(
      files.map(async (file) => ({
        ...file,
        url: await this.storage.getSignedUrl(file.storageKey),
      })),
    );
  }
}
