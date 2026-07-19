import { Injectable } from '@nestjs/common';
import { AdmissionNotificationType, Prisma } from '@prisma/client';
import { PrismaService } from '../../core/database/prisma.service.js';

/**
 * Writes in-app notifications for admission workflow transitions.
 * Extension point: add email/WA channels here (single call site for all
 * transitions) via platform NotificationModule.
 */
@Injectable()
export class AdmissionNotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async notify(
    applicationId: string,
    type: AdmissionNotificationType,
    title: string,
    message: string,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = tx ?? this.prisma;
    await client.admissionNotification.create({
      data: { applicationId, type, title, message },
    });
  }
}
