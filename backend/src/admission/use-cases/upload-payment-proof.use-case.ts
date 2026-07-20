import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isEditable } from '../domain/admission-status.transitions.js';
import { serializePayment } from '../domain/admission.serializers.js';
import { IAdmissionApplicantRepository } from '../domain/interfaces/admission-applicant-repository.interface.js';
import { UploadPaymentProofDto } from '../dto/upload-payment-proof.dto.js';
import {
  assertValidAdmissionFile,
  saveAdmissionFile,
} from './upload-admission-document.use-case.js';

@Injectable()
export class UploadPaymentProofUseCase {
  constructor(private readonly repository: IAdmissionApplicantRepository) {}

  async execute(
    userId: string,
    dto: UploadPaymentProofDto,
    file: Express.Multer.File,
  ) {
    assertValidAdmissionFile(file);

    const application =
      await this.repository.findMyApplicationWithPayment(userId);
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

    const payment = await this.repository.savePaymentProof({
      paymentId: application.payment.id,
      file: {
        filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        storageKey,
        uploadedBy: userId,
      },
      bankName: dto.bankName,
      senderAccountName: dto.senderAccountName,
      transferDate: dto.transferDate ? new Date(dto.transferDate) : null,
    });

    return serializePayment(payment);
  }
}
