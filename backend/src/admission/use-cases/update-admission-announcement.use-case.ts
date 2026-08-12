import { Injectable, NotFoundException } from '@nestjs/common';
import { IAdmissionAnnouncementRepository } from '../domain/interfaces/admission-announcement-repository.interface.js';
import { UpdateAdmissionAnnouncementDto } from '../dto/request/update-admission-announcement.dto.js';

@Injectable()
export class UpdateAdmissionAnnouncementUseCase {
  constructor(
    private readonly admissionAnnouncementRepository: IAdmissionAnnouncementRepository,
  ) {}

  async execute(id: string, dto: UpdateAdmissionAnnouncementDto) {
    const announcement =
      await this.admissionAnnouncementRepository.findActiveById(id);
    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    const becomingPublished =
      dto.isPublished === true && !announcement.isPublished;

    return this.admissionAnnouncementRepository.update(id, {
      ...dto,
      ...(becomingPublished && { publishedAt: new Date() }),
    });
  }
}
