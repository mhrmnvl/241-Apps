import { Injectable, NotFoundException } from '@nestjs/common';
import { IAdmissionApplicantRepository } from '../domain/interfaces/admission-applicant-repository.interface.js';

@Injectable()
export class MarkNotificationReadUseCase {
  constructor(private readonly repository: IAdmissionApplicantRepository) {}

  async executeOne(userId: string, notificationId: string) {
    const notification = await this.repository.findMyNotification(
      userId,
      notificationId,
    );
    if (!notification) {
      throw new NotFoundException('Notifikasi tidak ditemukan');
    }

    return this.repository.markNotificationRead(
      notification.id,
      notification.readAt ?? new Date(),
    );
  }

  async executeAll(userId: string) {
    await this.repository.markAllNotificationsRead(userId);
    return { success: true };
  }
}
