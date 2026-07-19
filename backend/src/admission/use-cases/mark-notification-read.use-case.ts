import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service.js';

@Injectable()
export class MarkNotificationReadUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async executeOne(userId: string, notificationId: string) {
    const notification = await this.prisma.admissionNotification.findFirst({
      where: {
        id: notificationId,
        application: { userId, deletedAt: null },
      },
    });
    if (!notification) {
      throw new NotFoundException('Notifikasi tidak ditemukan');
    }

    return this.prisma.admissionNotification.update({
      where: { id: notification.id },
      data: { readAt: notification.readAt ?? new Date() },
    });
  }

  async executeAll(userId: string) {
    await this.prisma.admissionNotification.updateMany({
      where: { application: { userId, deletedAt: null }, readAt: null },
      data: { readAt: new Date() },
    });
    return { success: true };
  }
}
