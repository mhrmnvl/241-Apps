import { Injectable } from '@nestjs/common';
import { FileRepository } from '../repositories/file.repository.js';
import { StorageService } from '../../../core/storage/storage.service.js';

@Injectable()
export class GetFilesUseCase {
  constructor(
    private readonly repo: FileRepository,
    private readonly storage: StorageService,
  ) {}

  async execute() {
    const files = await this.repo.findMany();
    return Promise.all(
      files.map(async (file) => ({
        ...file,
        url: await this.storage.getSignedUrl(file.storageKey),
      })),
    );
  }
}
