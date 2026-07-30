import { Injectable, NotFoundException } from '@nestjs/common';
import { IAdmissionAnnouncementRepository } from '../domain/interfaces/admission-announcement-repository.interface.js';

@Injectable()
export class DeleteAdmissionAnnouncementUseCase {
  constructor(private readonly repository: IAdmissionAnnouncementRepository) {}

  async execute(id: string) {
    const announcement = await this.repository.findActiveById(id);
    if (!announcement) {
      throw new NotFoundException('Pengumuman tidak ditemukan');
    }

    return this.repository.softDelete(id);
  }
}
