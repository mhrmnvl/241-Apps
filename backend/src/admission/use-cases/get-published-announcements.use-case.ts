import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service.js';

@Injectable()
export class GetPublishedAnnouncementsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string) {
    const application = await this.prisma.admissionApplication.findFirst({
      where: { userId, deletedAt: null },
      select: { waveId: true },
    });

    return this.prisma.admissionAnnouncement.findMany({
      where: {
        isPublished: true,
        deletedAt: null,
        OR: [
          { waveId: null },
          ...(application ? [{ waveId: application.waveId }] : []),
        ],
      },
      include: { wave: { select: { id: true, name: true, code: true } } },
      orderBy: { publishedAt: 'desc' },
      take: 20,
    });
  }
}
