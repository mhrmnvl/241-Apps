import {
  AdmissionApplication,
  AdmissionDocumentType,
  AdmissionNotification,
  AdmissionNotificationType,
  AdmissionWave,
  IncomeRange,
  ParentRelation,
  Prisma,
  User,
} from '@prisma/client';

export { Prisma };
import { ApplicationDetail } from '../admission.includes.js';
import {
  AdmissionDocumentWithTypeAndFile,
  AdmissionPaymentWithProof,
} from './admission-application-repository.interface.js';
import { AdmissionAnnouncementWithWave } from './admission-announcement-repository.interface.js';

export type ActiveWaveRow = Prisma.AdmissionWaveGetPayload<{
  include: {
    academicYear: true;
    _count: { select: { applications: true } };
  };
}>;

export interface RegisterApplicantInput {
  wave: AdmissionWave;
  identifier: string;
  passwordHash: string;
  fullName: string;
  phone: string | null;
}

export interface AdmissionApplicationParentInput {
  relation: ParentRelation;
  name: string;
  nik: string | null;
  birthPlace: string | null;
  birthDate: Date | null;
  phone: string | null;
  occupationId: string | null;
  educationId: string | null;
  income: IncomeRange | null;
  isPrimary: boolean;
}

export interface CreateDocumentFileInput {
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  uploadedBy: string;
}

export interface UploadPaymentProofInput {
  paymentId: string;
  file: CreateDocumentFileInput;
  bankName: string;
  senderAccountName: string;
  transferDate: Date | null;
}

export type ApplicationWithPayment = Prisma.AdmissionApplicationGetPayload<{
  include: { payment: true };
}>;

/**
 * Self-service persistence for an applicant acting on their own application
 * (looked up by userId), plus the public registration reads. Password hashing
 * and file-to-disk writes stay in the use-cases; this interface persists.
 */
export abstract class IAdmissionApplicantRepository {
  // ── Registration ──
  abstract findOpenWave(waveId: string): Promise<AdmissionWave | null>;
  abstract findActiveUserByIdentifier(identifier: string): Promise<User | null>;
  abstract findApplicantRoleId(): Promise<string | null>;
  abstract registerApplicant(
    input: RegisterApplicantInput,
  ): Promise<AdmissionApplication>;

  // ── Public reads ──
  abstract findActiveWaves(): Promise<ActiveWaveRow[]>;
  abstract findActiveDocumentTypes(): Promise<AdmissionDocumentType[]>;
  abstract findPublishedAnnouncementsForUser(
    userId: string,
  ): Promise<AdmissionAnnouncementWithWave[]>;

  // ── My application ──
  abstract findMyApplication(
    userId: string,
  ): Promise<AdmissionApplication | null>;
  abstract findMyApplicationWithPayment(
    userId: string,
  ): Promise<ApplicationWithPayment | null>;
  abstract findMyDetail(userId: string): Promise<ApplicationDetail | null>;
  abstract findRequiredActiveDocumentTypes(): Promise<AdmissionDocumentType[]>;
  abstract findDocumentTypeByCode(
    code: string,
  ): Promise<AdmissionDocumentType | null>;

  abstract updateMyApplication(input: {
    applicationId: string;
    data: Prisma.AdmissionApplicationUpdateInput;
    parents?: AdmissionApplicationParentInput[];
  }): Promise<ApplicationDetail>;
  abstract submitApplication(applicationId: string): Promise<ApplicationDetail>;

  abstract saveDocument(input: {
    applicationId: string;
    documentTypeId: string;
    file: CreateDocumentFileInput;
  }): Promise<AdmissionDocumentWithTypeAndFile>;
  abstract savePaymentProof(
    input: UploadPaymentProofInput,
  ): Promise<AdmissionPaymentWithProof>;

  // ── Notifications ──
  abstract createNotification(input: {
    applicationId: string;
    type: AdmissionNotificationType;
    title: string;
    message: string;
  }): Promise<AdmissionNotification>;
  abstract findApplicationIdByUser(userId: string): Promise<string | null>;
  abstract findNotifications(
    applicationId: string,
  ): Promise<{ data: AdmissionNotification[]; unreadCount: number }>;
  abstract findMyNotification(
    userId: string,
    notificationId: string,
  ): Promise<AdmissionNotification | null>;
  abstract markNotificationRead(
    notificationId: string,
    readAt: Date,
  ): Promise<AdmissionNotification>;
  abstract markAllNotificationsRead(userId: string): Promise<void>;
}
