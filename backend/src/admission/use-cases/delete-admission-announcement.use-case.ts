import { Injectable, NotFoundException } from '@nestjs/common';
import { IAdmissionAnnouncementRepository } from '../domain/interfaces/admission-announcement-repository.interface.js';

@Injectable()
export class DeleteAdmissionAnnouncementUseCase {
  constructor(
    private readonly admissionAnnouncementRepository: IAdmissionAnnouncementRepository,
  ) {}

  async execute(id: string) {
    const announcement =
      await this.admissionAnnouncementRepository.findActiveById(id);
    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    return this.admissionAnnouncementRepository.softDelete(id);
  }
}
