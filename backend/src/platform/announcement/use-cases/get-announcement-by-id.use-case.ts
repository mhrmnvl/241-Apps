import { Injectable, NotFoundException } from '@nestjs/common';
import { AnnouncementRepository } from '../repositories/announcement.repository.js';

@Injectable()
export class GetAnnouncementByIdUseCase {
  constructor(private readonly repository: AnnouncementRepository) {}

  async execute(id: string) {
    const announcement = await this.repository.findById(id);
    if (!announcement) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }
    return announcement;
  }
}
