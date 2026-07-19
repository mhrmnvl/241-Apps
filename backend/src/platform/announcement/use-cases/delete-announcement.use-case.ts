import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AnnouncementRepository } from '../repositories/announcement.repository.js';

@Injectable()
export class DeleteAnnouncementUseCase {
  private readonly logger = new Logger(DeleteAnnouncementUseCase.name);

  constructor(private readonly repository: AnnouncementRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }

    await this.repository.softDelete(id);
    this.logger.log(`Announcement soft-deleted: ${id}`);
  }
}
