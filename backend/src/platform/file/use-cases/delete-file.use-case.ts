import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { FileRepository } from '../repositories/file.repository.js';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DeleteFileUseCase {
  private readonly logger = new Logger(DeleteFileUseCase.name);

  constructor(private readonly repo: FileRepository) {}

  async execute(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    // Soft delete in the database
    await this.repo.softDelete(id);

    // Clean up physical file to save space
    const filePath = path.join(process.cwd(), existing.storageKey);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        this.logger.error(
          `Failed to delete physical file: ${filePath}`,
          err instanceof Error ? err.stack : undefined,
        );
      }
    }
  }
}
