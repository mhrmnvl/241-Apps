import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service.js';
import { serializePayment } from '../domain/admission.serializers.js';
import { VerifyPaymentDto } from '../dto/admin-actions.dto.js';
import { AdmissionNotificationService } from '../services/admission-notification.service.js';

@Injectable()
export class VerifyPaymentUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: AdmissionNotificationService,
  ) {}

  async execute(applicationId: string, dto: VerifyPaymentDto, adminId: string) {
    if (dto.status === 'REJECTED' && !dto.note?.trim()) {
      throw new BadRequestException('Alasan penolakan pembayaran wajib diisi');
    }

    const payment = await this.prisma.admissionPayment.findFirst({
      where: { applicationId },
    });
    if (!payment) {
      throw new NotFoundException('Data pembayaran tidak ditemukan');
    }
    if (payment.status === 'UNPAID' || !payment.proofFileId) {
      throw new ConflictException('Bukti pembayaran belum diunggah');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.admissionPayment.update({
        where: { id: payment.id },
        data: {
          status: dto.status,
          note: dto.note ?? null,
          verifiedById: adminId,
          verifiedAt: new Date(),
        },
        include: { proofFile: true },
      });

      await this.notifications.notify(
        applicationId,
        'PAYMENT',
        dto.status === 'VERIFIED'
          ? 'Pembayaran terverifikasi'
          : 'Bukti pembayaran ditolak',
        dto.status === 'VERIFIED'
          ? 'Bukti pembayaran Anda telah diverifikasi.'
          : `Bukti pembayaran Anda ditolak. Catatan: ${dto.note}. Silakan unggah ulang.`,
        tx,
      );

      return serializePayment(updated);
    });
  }
}
