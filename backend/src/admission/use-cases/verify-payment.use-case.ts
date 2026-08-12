import { AdmissionPaymentStatus } from '../../shared/domain/enums/admission-payment-status.enum.js';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { serializePayment } from '../domain/admission.serializers.js';
import { IAdmissionApplicationRepository } from '../domain/interfaces/admission-application-repository.interface.js';
import { VerifyPaymentDto } from '../dto/request/verify-payment.dto.js';
import { AdmissionNotificationService } from '../services/admission-notification.service.js';

@Injectable()
export class VerifyPaymentUseCase {
  constructor(
    private readonly admissionApplicationRepository: IAdmissionApplicationRepository,
    private readonly notifications: AdmissionNotificationService,
  ) {}

  async execute(applicationId: string, dto: VerifyPaymentDto, adminId: string) {
    if (dto.status === AdmissionPaymentStatus.REJECTED && !dto.note?.trim()) {
      throw new BadRequestException('A payment rejection reason is required');
    }

    const payment =
      await this.admissionApplicationRepository.findPayment(applicationId);
    if (!payment) {
      throw new NotFoundException('Payment record not found');
    }
    if (payment.status === 'UNPAID' || !payment.proofFileId) {
      throw new ConflictException('Payment proof has not been uploaded');
    }

    const updated =
      await this.admissionApplicationRepository.updatePaymentStatus(
        payment.id,
        {
          status: dto.status,
          note: dto.note ?? null,
          adminId,
        },
      );

    await this.notifications.notify(
      applicationId,
      'PAYMENT',
      dto.status === AdmissionPaymentStatus.VERIFIED
        ? 'Pembayaran terverifikasi'
        : 'Bukti pembayaran ditolak',
      dto.status === AdmissionPaymentStatus.VERIFIED
        ? 'Bukti pembayaran Anda telah diverifikasi.'
        : `Bukti pembayaran Anda ditolak. Catatan: ${dto.note}. Silakan unggah ulang.`,
    );

    return serializePayment(updated);
  }
}
