import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IAnnouncementRepository } from '../domain/interfaces/announcement-repository.interface.js';

@Injectable()
export class DeleteAnnouncementUseCase {
  private readonly logger = new Logger(DeleteAnnouncementUseCase.name);

  constructor(
    private readonly announcementRepository: IAnnouncementRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.announcementRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }

    await this.announcementRepository.softDelete(id);
    this.logger.log(`Announcement soft-deleted: ${id}`);
  }
}
