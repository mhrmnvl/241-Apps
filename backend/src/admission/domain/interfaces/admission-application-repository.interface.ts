import {
  AdmissionDocumentWithType,
  AdmissionDocumentWithTypeAndFile,
  AdmissionPaymentWithProof,
  AdmissionStatusCount,
  AdmissionWaveAcceptedCount,
  ApplicationWithDocsAndPayment,
  ApplicationWithParentsAndUser,
  ApplicationWithWave,
  EnrollResult,
  AdmissionApplicationEntity,
  AdmissionApplicationListRow,
} from '../entities/admission.entity.js';
import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../shared/domain/interfaces/repository.interface.js';
import { AdmissionStatus } from '../../../shared/domain/enums/admission-status.enum.js';
import { AdmissionDocumentStatus } from '../../../shared/domain/enums/admission-document-status.enum.js';
import { AdmissionPaymentStatus } from '../../../shared/domain/enums/admission-payment-status.enum.js';

export type {
  AdmissionDocumentWithType,
  AdmissionDocumentWithTypeAndFile,
  AdmissionPaymentWithProof,
  AdmissionStatusCount,
  AdmissionWaveAcceptedCount,
  ApplicationWithDocsAndPayment,
  ApplicationWithParentsAndUser,
  ApplicationWithWave,
  EnrollResult,
};

/** Document-type master row as consumed by the application read models. */
export interface AdmissionDocumentTypeRow {
  id: string;
  code: string;
  name: string;
  isRequired: boolean;
  sortOrder: number;
  isActive: boolean;
}

export interface AdmissionApplicationQueryInput extends PaginationQueryInput {
  search?: string;
  status?: AdmissionStatus;
  waveId?: string;
}

export interface CreateAdmissionApplicationRepositoryInput {
  userId: string;
  waveId: string;
  registrationNumber: string;
  fullName: string;
  status?: AdmissionStatus;
  nickname?: string | null;
  birthPlace?: string | null;
  birthDate?: Date | null;
  nik?: string | null;
  nisn?: string | null;
  religionId?: string | null;
  phone?: string | null;
  email?: string | null;
}

export type UpdateAdmissionApplicationRepositoryInput =
  Partial<CreateAdmissionApplicationRepositoryInput>;

/** Verification verdict recorded against a single uploaded document. */
export interface UpdateAdmissionDocumentStatusInput {
  status: AdmissionDocumentStatus;
  note: string | null;
  adminId: string;
}

/** Verification verdict recorded against the registration payment. */
export interface UpdateAdmissionPaymentStatusInput {
  status: AdmissionPaymentStatus;
  note: string | null;
  adminId: string;
}

export interface AcceptAdmissionApplicationInput {
  id: string;
  adminId: string;
  note: string | null;
}

export interface RejectAdmissionApplicationInput {
  id: string;
  adminId: string;
  reason: string;
}

/**
 * Student identity assigned at enrolment. Mirrors the admin action payload but
 * is owned by the domain, so the port does not depend on the HTTP DTO.
 */
export interface EnrollApplicantRepositoryInput {
  nis: string;
  nisn: string;
  gradeId: string;
  classroomId?: string;
}

export abstract class IAdmissionApplicationRepository {
  abstract findAll(
    query: AdmissionApplicationQueryInput,
  ): Promise<PaginatedResult<AdmissionApplicationListRow>>;
  abstract findById(id: string): Promise<ApplicationWithParentsAndUser | null>;
  abstract findActiveById(
    id: string,
  ): Promise<ApplicationWithParentsAndUser | null>;
  abstract findByApplicantId(
    applicantId: string,
  ): Promise<ApplicationWithParentsAndUser | null>;
  abstract create(
    input: CreateAdmissionApplicationRepositoryInput,
  ): Promise<AdmissionApplicationEntity>;
  abstract update(
    id: string,
    input: UpdateAdmissionApplicationRepositoryInput,
  ): Promise<AdmissionApplicationEntity>;
  abstract remove(id: string): Promise<AdmissionApplicationEntity>;

  abstract setRevisionNeeded(
    id: string,
    note: string,
  ): Promise<ApplicationWithDocsAndPayment>;
  abstract findActiveWithDocsAndPayment(
    id: string,
  ): Promise<ApplicationWithDocsAndPayment | null>;
  abstract findRequiredActiveDocumentTypes(): Promise<
    AdmissionDocumentTypeRow[]
  >;
  abstract setVerified(
    id: string,
    adminId: string,
  ): Promise<ApplicationWithDocsAndPayment>;
  abstract findDocument(
    applicationId: string,
    documentId: string,
  ): Promise<AdmissionDocumentWithType | null>;
  abstract updateDocumentStatus(
    documentId: string,
    input: UpdateAdmissionDocumentStatusInput,
  ): Promise<AdmissionDocumentWithTypeAndFile>;
  abstract findPayment(
    applicationId: string,
  ): Promise<AdmissionPaymentWithProof | null>;
  abstract updatePaymentStatus(
    paymentId: string,
    input: UpdateAdmissionPaymentStatusInput,
  ): Promise<AdmissionPaymentWithProof>;
  abstract findActiveWithWave(id: string): Promise<ApplicationWithWave | null>;
  abstract countAcceptedInWave(waveId: string): Promise<number>;
  abstract setAccepted(
    input: AcceptAdmissionApplicationInput,
  ): Promise<ApplicationWithDocsAndPayment>;
  abstract findActiveWithParentsAndUser(
    id: string,
  ): Promise<ApplicationWithParentsAndUser | null>;
  abstract isNisTaken(nis: string): Promise<boolean>;
  abstract isNisnTaken(nisn: string): Promise<boolean>;
  abstract isNikTakenInProfiles(nik: string): Promise<boolean>;
  abstract findStudentRoleId(): Promise<string | null>;
  abstract enrollAsStudent(
    application: ApplicationWithParentsAndUser,
    input: EnrollApplicantRepositoryInput,
    studentRoleId: string,
  ): Promise<EnrollResult>;
  abstract getStatusCounts(waveId?: string): Promise<AdmissionStatusCount[]>;
  abstract getWavesWithAcceptedCount(
    waveId?: string,
  ): Promise<AdmissionWaveAcceptedCount[]>;
  abstract findAdminDetailById(
    id: string,
  ): Promise<ApplicationWithParentsAndUser | null>;
  abstract countByNik(nik: string, excludeId: string): Promise<number>;
  abstract findActiveDocumentTypes(): Promise<AdmissionDocumentTypeRow[]>;
  abstract setRejected(
    input: RejectAdmissionApplicationInput,
  ): Promise<ApplicationWithDocsAndPayment>;
}
