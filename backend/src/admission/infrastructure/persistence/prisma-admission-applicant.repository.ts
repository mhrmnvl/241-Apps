import { Injectable } from '@nestjs/common';
import {
  AdmissionApplication,
  AdmissionDocumentType,
  AdmissionNotification,
  AdmissionWave,
  User,
} from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service.js';
import { AccountProvisioningService } from '../../../platform/user/index.js';
import {
  applicationDetailInclude,
  ApplicationDetail,
} from '../../domain/admission.includes.js';
import {
  AdmissionDocumentWithTypeAndFile,
  AdmissionPaymentWithProof,
} from '../../domain/interfaces/admission-application-repository.interface.js';
import { AdmissionAnnouncementWithWave } from '../../domain/interfaces/admission-announcement-repository.interface.js';
import {
  ActiveWaveRow,
  ApplicationWithPayment,
  IAdmissionApplicantRepository,
  RegisterApplicantInput,
  UploadPaymentProofInput,
  type AdmissionApplicationParentInput,
  type CreateDocumentFileInput,
} from '../../domain/interfaces/admission-applicant-repository.interface.js';
import type { Prisma } from '@prisma/client';

@Injectable()
export class PrismaAdmissionApplicantRepository extends IAdmissionApplicantRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accountProvisioning: AccountProvisioningService,
  ) {
    super();
  }

  // ── Registration ──

  async findOpenWave(waveId: string): Promise<AdmissionWave | null> {
    const today = new Date();
    return this.prisma.admissionWave.findFirst({
      where: {
        id: waveId,
        isActive: true,
        deletedAt: null,
        startDate: { lte: today },
        endDate: { gte: today },
      },
    });
  }

  async findActiveUserByIdentifier(identifier: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { identifier, deletedAt: null },
    });
  }

  async findApplicantRoleId(): Promise<string | null> {
    const role = await this.prisma.role.findUnique({
      where: { code: 'APPLICANT' },
    });
    return role?.id ?? null;
  }

  async registerApplicant(
    input: RegisterApplicantInput,
  ): Promise<AdmissionApplication> {
    return this.prisma.$transaction(async (tx) => {
      const user = await this.accountProvisioning.provision(tx, {
        identifier: input.identifier,
        passwordHash: input.passwordHash,
        roleCode: 'APPLICANT',
      });

      const updatedWave = await tx.admissionWave.update({
        where: { id: input.wave.id },
        data: { lastRegistrationSeq: { increment: 1 } },
      });
      const registrationNumber = `${input.wave.code}-${String(
        updatedWave.lastRegistrationSeq,
      ).padStart(4, '0')}`;

      const app = await tx.admissionApplication.create({
        data: {
          userId: user.id,
          waveId: input.wave.id,
          registrationNumber,
          status: 'DRAFT',
          fullName: input.fullName,
          email: input.identifier,
          phone: input.phone,
        },
      });

      await tx.admissionPayment.create({
        data: {
          applicationId: app.id,
          amount: input.wave.registrationFee,
          status: 'UNPAID',
        },
      });

      await tx.admissionNotification.create({
        data: {
          applicationId: app.id,
          type: 'GENERAL',
          title: 'Selamat datang di pendaftaran santri baru',
          message: `Akun Anda berhasil dibuat dengan nomor pendaftaran ${registrationNumber}. Silakan lengkapi formulir, unggah berkas, dan lakukan pembayaran.`,
        },
      });

      return app;
    });
  }

  // ── Public reads ──

  async findActiveWaves(): Promise<ActiveWaveRow[]> {
    const today = new Date();
    return this.prisma.admissionWave.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        startDate: { lte: today },
        endDate: { gte: today },
      },
      include: {
        academicYear: true,
        _count: {
          select: {
            applications: {
              where: { status: { not: 'REJECTED' }, deletedAt: null },
            },
          },
        },
      },
      orderBy: { startDate: 'asc' },
    });
  }

  async findActiveDocumentTypes(): Promise<AdmissionDocumentType[]> {
    return this.prisma.admissionDocumentType.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findPublishedAnnouncementsForUser(
    userId: string,
  ): Promise<AdmissionAnnouncementWithWave[]> {
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

  // ── My application ──

  async findMyApplication(
    userId: string,
  ): Promise<AdmissionApplication | null> {
    return this.prisma.admissionApplication.findFirst({
      where: { userId, deletedAt: null },
    });
  }

  async findMyApplicationWithPayment(
    userId: string,
  ): Promise<ApplicationWithPayment | null> {
    return this.prisma.admissionApplication.findFirst({
      where: { userId, deletedAt: null },
      include: { payment: true },
    });
  }

  async findMyDetail(userId: string): Promise<ApplicationDetail | null> {
    return this.prisma.admissionApplication.findFirst({
      where: { userId, deletedAt: null },
      include: applicationDetailInclude,
    });
  }

  async findRequiredActiveDocumentTypes(): Promise<AdmissionDocumentType[]> {
    return this.prisma.admissionDocumentType.findMany({
      where: { isActive: true, isRequired: true },
    });
  }

  async findDocumentTypeByCode(
    code: string,
  ): Promise<AdmissionDocumentType | null> {
    return this.prisma.admissionDocumentType.findFirst({
      where: { code, isActive: true },
    });
  }

  async updateMyApplication(input: {
    applicationId: string;
    data: Prisma.AdmissionApplicationUpdateInput;
    parents?: AdmissionApplicationParentInput[];
  }): Promise<ApplicationDetail> {
    return this.prisma.$transaction(async (tx) => {
      await tx.admissionApplication.update({
        where: { id: input.applicationId },
        data: input.data,
      });

      if (input.parents !== undefined) {
        await tx.admissionApplicationParent.deleteMany({
          where: { applicationId: input.applicationId },
        });
        for (const p of input.parents) {
          await tx.admissionApplicationParent.create({
            data: { applicationId: input.applicationId, ...p },
          });
        }
      }

      return tx.admissionApplication.findUniqueOrThrow({
        where: { id: input.applicationId },
        include: applicationDetailInclude,
      });
    });
  }

  async submitApplication(applicationId: string): Promise<ApplicationDetail> {
    return this.prisma.admissionApplication.update({
      where: { id: applicationId },
      data: { status: 'SUBMITTED', submittedAt: new Date() },
      include: applicationDetailInclude,
    });
  }

  async saveDocument(input: {
    applicationId: string;
    documentTypeId: string;
    file: CreateDocumentFileInput;
  }): Promise<AdmissionDocumentWithTypeAndFile> {
    return this.prisma.$transaction(async (tx) => {
      const fileRow = await tx.file.create({ data: input.file });

      // Re-upload replaces the file and resets verification to PENDING.
      return tx.admissionDocument.upsert({
        where: {
          applicationId_documentTypeId: {
            applicationId: input.applicationId,
            documentTypeId: input.documentTypeId,
          },
        },
        update: {
          fileId: fileRow.id,
          status: 'PENDING',
          note: null,
          verifiedById: null,
          verifiedAt: null,
        },
        create: {
          applicationId: input.applicationId,
          documentTypeId: input.documentTypeId,
          fileId: fileRow.id,
          status: 'PENDING',
        },
        include: { documentType: true, file: true },
      });
    });
  }

  async savePaymentProof(
    input: UploadPaymentProofInput,
  ): Promise<AdmissionPaymentWithProof> {
    return this.prisma.$transaction(async (tx) => {
      const fileRow = await tx.file.create({ data: input.file });

      return tx.admissionPayment.update({
        where: { id: input.paymentId },
        data: {
          bankName: input.bankName,
          senderAccountName: input.senderAccountName,
          transferDate: input.transferDate,
          proofFileId: fileRow.id,
          status: 'PENDING',
          note: null,
          verifiedById: null,
          verifiedAt: null,
        },
        include: { proofFile: true },
      });
    });
  }

  // ── Notifications ──

  async findApplicationIdByUser(userId: string): Promise<string | null> {
    const application = await this.prisma.admissionApplication.findFirst({
      where: { userId, deletedAt: null },
      select: { id: true },
    });
    return application?.id ?? null;
  }

  async findNotifications(
    applicationId: string,
  ): Promise<{ data: AdmissionNotification[]; unreadCount: number }> {
    const [data, unreadCount] = await Promise.all([
      this.prisma.admissionNotification.findMany({
        where: { applicationId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      this.prisma.admissionNotification.count({
        where: { applicationId, readAt: null },
      }),
    ]);
    return { data, unreadCount };
  }

  async findMyNotification(
    userId: string,
    notificationId: string,
  ): Promise<AdmissionNotification | null> {
    return this.prisma.admissionNotification.findFirst({
      where: {
        id: notificationId,
        application: { userId, deletedAt: null },
      },
    });
  }

  async markNotificationRead(
    notificationId: string,
    readAt: Date,
  ): Promise<AdmissionNotification> {
    return this.prisma.admissionNotification.update({
      where: { id: notificationId },
      data: { readAt },
    });
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await this.prisma.admissionNotification.updateMany({
      where: { application: { userId, deletedAt: null }, readAt: null },
      data: { readAt: new Date() },
    });
  }
}
