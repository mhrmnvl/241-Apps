import {
  AdmissionApplication,
  AdmissionDocumentStatus,
  AdmissionDocumentType,
  AdmissionPayment,
  AdmissionPaymentStatus,
  AdmissionStatus,
  Prisma,
  Student,
} from '@prisma/client';
import { AdmissionApplicationQueryDto } from '../../dto/request/admission-query.dto.js';
import { EnrollApplicantDto } from '../../dto/request/admin-actions.dto.js';
import { PaginatedResult } from '../../../shared/domain/interfaces/repository.interface.js';
import {
  ApplicationAdminDetail,
  ApplicationDetail,
  ApplicationListItem,
} from '../admission.includes.js';

export interface AdmissionStatusCount {
  status: AdmissionStatus;
  count: number;
}

export interface AdmissionWaveAcceptedCount {
  id: string;
  name: string;
  code: string;
  quota: number;
  accepted: number;
}

export type ApplicationWithWave = Prisma.AdmissionApplicationGetPayload<{
  include: { wave: true };
}>;

export type ApplicationWithDocsAndPayment =
  Prisma.AdmissionApplicationGetPayload<{
    include: { documents: true; payment: true };
  }>;

export type ApplicationWithParentsAndUser =
  Prisma.AdmissionApplicationGetPayload<{
    include: { parents: true; user: true };
  }>;

export type AdmissionDocumentWithType = Prisma.AdmissionDocumentGetPayload<{
  include: { documentType: true };
}>;

export type AdmissionDocumentWithTypeAndFile =
  Prisma.AdmissionDocumentGetPayload<{
    include: { documentType: true; file: true };
  }>;

export type AdmissionPaymentWithProof = Prisma.AdmissionPaymentGetPayload<{
  include: { proofFile: true };
}>;

export interface EnrollResult {
  application: AdmissionApplication;
  student: Student;
  parentsLinked: number;
  enrollmentCreated: boolean;
}

/**
 * Persistence for the admission application aggregate (admin + workflow side).
 * Document and payment reads/writes are part of this aggregate. Business rules
 * (status transitions, required-doc checks) and notifications stay in the
 * use-cases; this interface only performs persistence.
 */
export abstract class IAdmissionApplicationRepository {
  // ── Read model ──
  abstract findAll(
    query: AdmissionApplicationQueryDto,
  ): Promise<PaginatedResult<ApplicationListItem>>;
  abstract findAdminDetailById(
    id: string,
  ): Promise<ApplicationAdminDetail | null>;
  abstract countByNik(nik: string, excludeId: string): Promise<number>;
  abstract findActiveDocumentTypes(): Promise<AdmissionDocumentType[]>;
  abstract getStatusCounts(waveId?: string): Promise<AdmissionStatusCount[]>;
  abstract getWavesWithAcceptedCount(
    waveId?: string,
  ): Promise<AdmissionWaveAcceptedCount[]>;

  // ── Workflow reads ──
  abstract findActiveById(id: string): Promise<AdmissionApplication | null>;
  abstract findActiveWithWave(id: string): Promise<ApplicationWithWave | null>;
  abstract findActiveWithDocsAndPayment(
    id: string,
  ): Promise<ApplicationWithDocsAndPayment | null>;
  abstract findActiveWithParentsAndUser(
    id: string,
  ): Promise<ApplicationWithParentsAndUser | null>;
  abstract countAcceptedInWave(waveId: string): Promise<number>;
  abstract findRequiredActiveDocumentTypes(): Promise<AdmissionDocumentType[]>;
  abstract findDocument(
    applicationId: string,
    documentId: string,
  ): Promise<AdmissionDocumentWithType | null>;
  abstract findPayment(applicationId: string): Promise<AdmissionPayment | null>;
  abstract findStudentRoleId(): Promise<string | null>;
  abstract isNisTaken(nis: string): Promise<boolean>;
  abstract isNisnTaken(nisn: string): Promise<boolean>;
  abstract isNikTakenInProfiles(nik: string): Promise<boolean>;

  // ── Workflow writes ──
  abstract updateDocumentStatus(
    documentId: string,
    input: {
      status: AdmissionDocumentStatus;
      note: string | null;
      adminId: string;
    },
  ): Promise<AdmissionDocumentWithTypeAndFile>;
  abstract updatePaymentStatus(
    paymentId: string,
    input: {
      status: AdmissionPaymentStatus;
      note: string | null;
      adminId: string;
    },
  ): Promise<AdmissionPaymentWithProof>;
  abstract setRevisionNeeded(
    id: string,
    note: string,
  ): Promise<ApplicationDetail>;
  abstract setVerified(id: string, adminId: string): Promise<ApplicationDetail>;
  abstract setAccepted(input: {
    id: string;
    adminId: string;
    note: string | null;
  }): Promise<ApplicationDetail>;
  abstract setRejected(input: {
    id: string;
    adminId: string;
    reason: string;
  }): Promise<ApplicationDetail>;

  /**
   * Cross-context enrollment: copies verified admission data into the real
   * student tables (profile, student, parents, address, role, optional
   * classroom enrollment) and marks the application ENROLLED — all atomically.
   */
  abstract enrollAsStudent(
    application: ApplicationWithParentsAndUser,
    dto: EnrollApplicantDto,
    studentRoleId: string,
  ): Promise<EnrollResult>;
}
