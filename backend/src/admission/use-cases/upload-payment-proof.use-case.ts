import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service.js';
import { isEditable } from '../domain/admission-status.transitions.js';
import { serializePayment } from '../domain/admission.serializers.js';
import { UploadPaymentProofDto } from '../dto/upload-payment-proof.dto.js';
import {
  assertValidAdmissionFile,
  saveAdmissionFile,
} from './upload-admission-document.use-case.js';

@Injectable()
export class UploadPaymentProofUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    userId: string,
    dto: UploadPaymentProofDto,
    file: Express.Multer.File,
  ) {
    assertValidAdmissionFile(file);

    const application = await this.prisma.admissionApplication.findFirst({
      where: { userId, deletedAt: null },
      include: { payment: true },
    });
    if (!application?.payment) {
      throw new NotFoundException('Data pendaftaran tidak ditemukan');
    }
    if (!isEditable(application.status)) {
      throw new ConflictException(
        'Bukti pembayaran hanya dapat diunggah saat status Draft atau Perlu Revisi',
      );
    }
    if (application.payment.status === 'VERIFIED') {
      throw new ConflictException('Pembayaran sudah diverifikasi');
    }

    const { filename, storageKey } = saveAdmissionFile(file, application.id);

    return this.prisma.$transaction(async (tx) => {
      const fileRow = await tx.file.create({
        data: {
          filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          sizeBytes: file.size,
          storageKey,
          uploadedBy: userId,
        },
      });

      const payment = await tx.admissionPayment.update({
        where: { id: application.payment!.id },
        data: {
          bankName: dto.bankName,
          senderAccountName: dto.senderAccountName,
          transferDate: dto.transferDate ? new Date(dto.transferDate) : null,
          proofFileId: fileRow.id,
          status: 'PENDING',
          note: null,
          verifiedById: null,
          verifiedAt: null,
        },
        include: { proofFile: true },
      });
      return serializePayment(payment);
    });
  }
}
