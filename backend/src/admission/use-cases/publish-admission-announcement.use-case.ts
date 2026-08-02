import { Injectable, NotFoundException } from '@nestjs/common';
import { IAdmissionAnnouncementRepository } from '../domain/interfaces/admission-announcement-repository.interface.js';

@Injectable()
export class PublishAdmissionAnnouncementUseCase {
  constructor(
    private readonly admissionAnnouncementRepository: IAdmissionAnnouncementRepository,
  ) {}

  async execute(id: string) {
    const announcement =
      await this.admissionAnnouncementRepository.findActiveById(id);
    if (!announcement) {
      throw new NotFoundException('Pengumuman tidak ditemukan');
    }

    const updated = await this.admissionAnnouncementRepository.publish(id);

    // Fan out an in-app notification to all applications in scope.
    await this.admissionAnnouncementRepository.notifyScope(
      announcement.waveId,
      announcement.title,
      announcement.content,
    );

    return updated;
  }
}
