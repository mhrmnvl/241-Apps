import { Injectable, NotFoundException } from '@nestjs/common';
import { IAdmissionAnnouncementRepository } from '../domain/interfaces/admission-announcement-repository.interface.js';

@Injectable()
export class PublishAdmissionAnnouncementUseCase {
  constructor(private readonly repository: IAdmissionAnnouncementRepository) {}

  async execute(id: string) {
    const announcement = await this.repository.findActiveById(id);
    if (!announcement) {
      throw new NotFoundException('Pengumuman tidak ditemukan');
    }

    const updated = await this.repository.publish(id);

    // Fan out an in-app notification to all applications in scope.
    await this.repository.notifyScope(
      announcement.waveId,
      announcement.title,
      announcement.content,
    );

    return updated;
  }
}
