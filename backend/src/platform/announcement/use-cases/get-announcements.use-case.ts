import { Injectable } from '@nestjs/common';
import { AnnouncementQueryDto } from '../dto/announcement-query.dto.js';
import { AnnouncementRepository } from '../repositories/announcement.repository.js';

@Injectable()
export class GetAnnouncementsUseCase {
  constructor(private readonly repository: AnnouncementRepository) {}

  async execute(query: AnnouncementQueryDto) {
    const { data, total, page, limit } = await this.repository.findAll(query);
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
