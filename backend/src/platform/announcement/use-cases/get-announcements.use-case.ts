import { Injectable } from '@nestjs/common';
import { AnnouncementQueryDto } from '../dto/request/announcement-query.dto.js';
import { IAnnouncementRepository } from '../domain/interfaces/announcement-repository.interface.js';

@Injectable()
export class GetAnnouncementsUseCase {
  constructor(
    private readonly announcementRepository: IAnnouncementRepository,
  ) {}

  async execute(query: AnnouncementQueryDto) {
    const { data, total, page, limit } =
      await this.announcementRepository.findAll(query);
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
