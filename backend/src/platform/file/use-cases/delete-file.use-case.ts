import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { FileRepository } from '../repositories/file.repository.js';
import { StorageService } from '../../../core/storage/storage.service.js';

@Injectable()
export class DeleteFileUseCase {
  private readonly logger = new Logger(DeleteFileUseCase.name);

  constructor(
    private readonly repository: FileRepository,
    private readonly storage: StorageService,
  ) {}

  async execute(id: string) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    // Soft delete in the database
    await this.repository.softDelete(id);

    // Clean up the object in storage to save space
    try {
      await this.storage.deleteFile(existing.storageKey);
    } catch (err) {
      this.logger.error(
        `Failed to delete stored object: ${existing.storageKey}`,
        err instanceof Error ? err.stack : undefined,
      );
    }
  }
}
