import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service.js';

@Injectable()
export class GetMyNotificationsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string) {
    const application = await this.prisma.admissionApplication.findFirst({
      where: { userId, deletedAt: null },
      select: { id: true },
    });
    if (!application) {
      throw new NotFoundException('Data pendaftaran tidak ditemukan');
    }

    const [notifications, unreadCount] = await Promise.all([
      this.prisma.admissionNotification.findMany({
        where: { applicationId: application.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      this.prisma.admissionNotification.count({
        where: { applicationId: application.id, readAt: null },
      }),
    ]);

    return { data: notifications, unreadCount };
  }
}
