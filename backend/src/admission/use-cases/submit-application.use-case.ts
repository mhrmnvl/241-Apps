import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service.js';
import { assertTransition } from '../domain/admission-status.transitions.js';
import { applicationDetailInclude } from '../domain/admission.includes.js';
import { serializeApplicationDetail } from '../domain/admission.serializers.js';
import { AdmissionNotificationService } from '../services/admission-notification.service.js';

const REQUIRED_FIELDS = [
  'fullName',
  'gender',
  'birthPlace',
  'birthDate',
  'street',
  'rt',
  'rw',
  'village',
  'district',
  'city',
  'province',
] as const;

const FIELD_LABELS: Record<string, string> = {
  fullName: 'Nama lengkap',
  gender: 'Jenis kelamin',
  birthPlace: 'Tempat lahir',
  birthDate: 'Tanggal lahir',
  street: 'Alamat (jalan)',
  rt: 'RT',
  rw: 'RW',
  village: 'Desa/Kelurahan',
  district: 'Kecamatan',
  city: 'Kota/Kabupaten',
  province: 'Provinsi',
};

@Injectable()
export class SubmitApplicationUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: AdmissionNotificationService,
  ) {}

  async execute(userId: string) {
    const application = await this.prisma.admissionApplication.findFirst({
      where: { userId, deletedAt: null },
      include: applicationDetailInclude,
    });
    if (!application) {
      throw new NotFoundException('Data pendaftaran tidak ditemukan');
    }

    assertTransition(application.status, 'SUBMITTED');

    const today = new Date();
    if (application.wave.endDate < today) {
      throw new ConflictException('Gelombang pendaftaran sudah ditutup');
    }

    const missing = REQUIRED_FIELDS.filter((f) => !application[f]).map(
      (f) => FIELD_LABELS[f] ?? f,
    );
    if (application.parents.length === 0) {
      missing.push('Data orang tua/wali (minimal satu)');
    }

    const requiredTypes = await this.prisma.admissionDocumentType.findMany({
      where: { isActive: true, isRequired: true },
    });
    for (const type of requiredTypes) {
      const doc = application.documents.find(
        (d) => d.documentTypeId === type.id,
      );
      if (!doc) {
        missing.push(`Berkas ${type.name}`);
      } else if (doc.status === 'REJECTED') {
        missing.push(`Berkas ${type.name} (ditolak, unggah ulang)`);
      }
    }

    if (
      !application.payment ||
      application.payment.status === 'UNPAID' ||
      !application.payment.proofFileId
    ) {
      missing.push('Bukti pembayaran');
    } else if (application.payment.status === 'REJECTED') {
      missing.push('Bukti pembayaran (ditolak, unggah ulang)');
    }

    if (missing.length > 0) {
      throw new BadRequestException(
        `Data belum lengkap: ${missing.join(', ')}`,
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const app = await tx.admissionApplication.update({
        where: { id: application.id },
        data: { status: 'SUBMITTED', submittedAt: new Date() },
        include: applicationDetailInclude,
      });
      await this.notifications.notify(
        application.id,
        'STATUS_CHANGE',
        'Formulir terkirim',
        'Formulir pendaftaran Anda telah dikirim dan sedang menunggu verifikasi admin.',
        tx,
      );
      return app;
    });

    return serializeApplicationDetail(updated);
  }
}
