import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { IFileRepository } from '../domain/interfaces/file-repository.interface.js';
import { IFileUsageChecker } from '../domain/interfaces/file-usage-checker.interface.js';
import { StorageService } from '../../../core/storage/storage.service.js';

@Injectable()
export class DeleteFileUseCase {
  private readonly logger = new Logger(DeleteFileUseCase.name);

  constructor(
    private readonly fileRepository: IFileRepository,
    private readonly storage: StorageService,
    // Optional: with no implementer registered this behaves exactly as it did
    // before the port existed. See IFileUsageChecker for the direction rule.
    @Optional() private readonly usageChecker?: IFileUsageChecker,
  ) {}

  async execute(id: string) {
    const existing = await this.fileRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    // Checked before anything is touched: this deletes the stored object too,
    // so "delete then discover it was in use" is not recoverable (FR-058).
    const references = (await this.usageChecker?.findReferences(id)) ?? [];
    if (references.length > 0) {
      throw new ConflictException({
        message: `This file is still used by ${references.length} portal item(s). Detach it from them before deleting.`,
        references,
      });
    }

    // Soft delete in the database
    await this.fileRepository.softDelete(id);

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
