import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isEditable } from '../domain/admission-status.transitions.js';
import { serializePayment } from '../domain/admission.serializers.js';
import { IAdmissionApplicantRepository } from '../domain/interfaces/admission-applicant-repository.interface.js';
import { UploadPaymentProofDto } from '../dto/request/upload-payment-proof.dto.js';
import { StorageService } from '../../core/storage/storage.service.js';
import { StorageKeyBuilder } from '../../core/storage/storage-key-builder.service.js';
import {
  assertValidAdmissionFile,
  saveAdmissionFile,
} from './upload-admission-document.use-case.js';

@Injectable()
export class UploadPaymentProofUseCase {
  constructor(
    private readonly admissionApplicantRepository: IAdmissionApplicantRepository,
    private readonly storage: StorageService,
    private readonly keyBuilder: StorageKeyBuilder,
  ) {}

  async execute(
    userId: string,
    dto: UploadPaymentProofDto,
    file: Express.Multer.File,
  ) {
    assertValidAdmissionFile(file);

    const application =
      await this.admissionApplicantRepository.findMyApplicationWithPayment(
        userId,
      );
    if (!application?.payment) {
      throw new NotFoundException('Application not found');
    }
    if (!isEditable(application.status)) {
      throw new ConflictException(
        'Payment proof can only be uploaded while the application is DRAFT or NEEDS_REVISION',
      );
    }
    if (application.payment.status === 'VERIFIED') {
      throw new ConflictException('The payment has already been verified');
    }

    const { filename, storageKey } = await saveAdmissionFile(
      this.storage,
      this.keyBuilder,
      file,
      ['payments'],
    );

    const payment = await this.admissionApplicantRepository.savePaymentProof({
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
