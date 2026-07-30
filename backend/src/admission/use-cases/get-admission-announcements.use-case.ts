import { Injectable } from '@nestjs/common';
import { IAdmissionAnnouncementRepository } from '../domain/interfaces/admission-announcement-repository.interface.js';
import { AdmissionAnnouncementQueryDto } from '../dto/request/admission-announcement-query.dto.js';

@Injectable()
export class GetAdmissionAnnouncementsUseCase {
  constructor(private readonly repository: IAdmissionAnnouncementRepository) {}

  async execute(query: AdmissionAnnouncementQueryDto) {
    const { data, total, page, limit } = await this.repository.findAll(query);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
