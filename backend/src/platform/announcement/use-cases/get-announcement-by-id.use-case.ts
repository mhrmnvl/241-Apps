import { Injectable, NotFoundException } from '@nestjs/common';
import { IAnnouncementRepository } from '../domain/interfaces/announcement-repository.interface.js';

@Injectable()
export class GetAnnouncementByIdUseCase {
  constructor(
    private readonly announcementRepository: IAnnouncementRepository,
  ) {}

  async execute(id: string) {
    const announcement = await this.announcementRepository.findById(id);
    if (!announcement) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }
    return announcement;
  }
}
