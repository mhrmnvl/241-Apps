import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { serializePayment } from '../domain/admission.serializers.js';
import { IAdmissionApplicationRepository } from '../domain/interfaces/admission-application-repository.interface.js';
import { VerifyPaymentDto } from '../dto/admin-actions.dto.js';
import { AdmissionNotificationService } from '../services/admission-notification.service.js';

@Injectable()
export class VerifyPaymentUseCase {
  constructor(
    private readonly repository: IAdmissionApplicationRepository,
    private readonly notifications: AdmissionNotificationService,
  ) {}

  async execute(applicationId: string, dto: VerifyPaymentDto, adminId: string) {
    if (dto.status === 'REJECTED' && !dto.note?.trim()) {
      throw new BadRequestException('Alasan penolakan pembayaran wajib diisi');
    }

    const payment = await this.repository.findPayment(applicationId);
    if (!payment) {
      throw new NotFoundException('Data pembayaran tidak ditemukan');
    }
    if (payment.status === 'UNPAID' || !payment.proofFileId) {
      throw new ConflictException('Bukti pembayaran belum diunggah');
    }

    const updated = await this.repository.updatePaymentStatus(payment.id, {
      status: dto.status,
      note: dto.note ?? null,
      adminId,
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
    );

    return serializePayment(updated);
  }
}
