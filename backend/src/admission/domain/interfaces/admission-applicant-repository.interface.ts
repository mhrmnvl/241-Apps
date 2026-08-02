import {
  ActiveWaveRow,
  AdmissionApplicantEntity,
  AdmissionWaveEntity,
  AdmissionDocumentWithTypeAndFile,
  AdmissionPaymentWithProof,
  ApplicationWithDocsAndPayment,
  ApplicationWithParentsAndUser,
} from '../entities/admission.entity.js';
import { AdmissionAnnouncementEntity } from '../entities/admission.entity.js';
import { AdmissionDocumentTypeRow } from './admission-application-repository.interface.js';
import { DecimalValue } from '../../../shared/domain/types/decimal.type.js';
import { AdmissionNotificationType } from '../../../shared/domain/enums/admission-notification-type.enum.js';
import { IncomeRange } from '../../../shared/domain/enums/income-range.enum.js';
import { ParentRelation } from '../../../shared/domain/enums/parent-relation.enum.js';
import { UserGender } from '../../../shared/domain/enums/user-gender.enum.js';

export type { ActiveWaveRow, AdmissionDocumentTypeRow };
export type ApplicationWithPayment = ApplicationWithDocsAndPayment;

/** Minimal user account row the registration flow needs to detect duplicates. */
export interface AdmissionUserAccountRow {
  id: string;
  identifier: string;
  isActive: boolean;
  deletedAt: Date | null;
}

/**
 * Row types use the enum's *value union* (`` `${Enum}` ``) rather than the enum
 * itself: persistence returns plain strings, and a TS string enum is nominal —
 * a raw `'STATUS_CHANGE'` is not assignable to it. Inputs keep the enum so
 * callers get autocomplete; outputs stay structurally compatible.
 */
export interface AdmissionNotificationRow {
  id: string;
  applicationId: string;
  type: `${AdmissionNotificationType}`;
  title: string;
  message: string;
  readAt: Date | null;
  createdAt: Date;
}

/** Parent/guardian record, fully replaced on each form submission. */
export interface AdmissionApplicationParentInput {
  relation: ParentRelation;
  name: string;
  nik?: string | null;
  birthPlace?: string | null;
  birthDate?: Date | null;
  phone?: string | null;
  occupationId?: string | null;
  educationId?: string | null;
  income?: IncomeRange | null;
  isPrimary?: boolean;
}

/** File metadata persisted alongside an uploaded document or payment proof. */
export interface CreateDocumentFileInput {
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  uploadedBy?: string | null;
}

/**
 * Wave data the registration transaction needs. Passed in rather than re-read
 * so the caller's open-wave check and the number allocation stay consistent.
 */
export interface RegisterApplicantWaveInput {
  id: string;
  code: string;
  registrationFee: DecimalValue;
}

export interface RegisterApplicantInput {
  wave: RegisterApplicantWaveInput;
  identifier: string;
  passwordHash: string;
  fullName: string;
  phone?: string | null;
}

/** Applicant-editable subset of the application form. */
export interface UpdateMyApplicationFields {
  fullName?: string;
  nickname?: string;
  gender?: UserGender;
  birthPlace?: string;
  birthDate?: Date;
  nik?: string;
  nisn?: string;
  religionId?: string;
  phone?: string;
  childOrder?: number;
  siblingCount?: number;
  street?: string;
  rt?: string;
  rw?: string;
  village?: string;
  district?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  previousSchoolName?: string;
  previousSchoolNpsn?: string;
  previousSchoolAddress?: string;
  graduationYear?: number;
}

export interface UpdateMyApplicationInput {
  applicationId: string;
  data: UpdateMyApplicationFields;
  /** When present, replaces the whole parent set. */
  parents?: AdmissionApplicationParentInput[];
}

export interface SaveAdmissionDocumentInput {
  applicationId: string;
  documentTypeId: string;
  file: CreateDocumentFileInput;
}

export interface SavePaymentProofInput {
  paymentId: string;
  file: CreateDocumentFileInput;
  bankName: string;
  senderAccountName: string;
  transferDate: Date | null;
}

export interface CreateAdmissionNotificationInput {
  applicationId: string;
  type: `${AdmissionNotificationType}`;
  title: string;
  message: string;
}

export abstract class IAdmissionApplicantRepository {
  abstract findAll(): Promise<ActiveWaveRow[]>;
  abstract findById(id: string): Promise<AdmissionApplicantEntity | null>;
  abstract findByUserId(
    userId: string,
  ): Promise<AdmissionApplicantEntity | null>;
  abstract findByRegistrationNumber(
    regNum: string,
  ): Promise<AdmissionApplicantEntity | null>;
  abstract create(
    applicationId: string,
  ): Promise<ApplicationWithParentsAndUser>;
  abstract update(
    id: string,
    input: UpdateMyApplicationFields,
  ): Promise<AdmissionApplicantEntity>;
  abstract remove(id: string): Promise<AdmissionApplicantEntity>;

  abstract findOpenWave(waveId: string): Promise<AdmissionWaveEntity | null>;
  abstract findActiveUserByIdentifier(
    identifier: string,
  ): Promise<AdmissionUserAccountRow | null>;
  abstract findMyDetail(
    userId: string,
  ): Promise<ApplicationWithParentsAndUser | null>;
  abstract findRequiredActiveDocumentTypes(): Promise<
    AdmissionDocumentTypeRow[]
  >;
  abstract submitApplication(
    applicationId: string,
  ): Promise<ApplicationWithParentsAndUser>;
  abstract findMyApplication(
    userId: string,
  ): Promise<ApplicationWithDocsAndPayment | null>;
  abstract updateMyApplication(
    input: UpdateMyApplicationInput,
  ): Promise<ApplicationWithParentsAndUser>;
  abstract findDocumentTypeByCode(
    code: string,
  ): Promise<AdmissionDocumentTypeRow | null>;
  abstract saveDocument(
    input: SaveAdmissionDocumentInput,
  ): Promise<AdmissionDocumentWithTypeAndFile>;
  abstract findMyApplicationWithPayment(
    userId: string,
  ): Promise<ApplicationWithPayment | null>;
  abstract savePaymentProof(
    input: SavePaymentProofInput,
  ): Promise<AdmissionPaymentWithProof>;
  abstract createNotification(
    input: CreateAdmissionNotificationInput,
  ): Promise<AdmissionNotificationRow>;
  abstract findActiveWaves(): Promise<ActiveWaveRow[]>;
  abstract findActiveDocumentTypes(): Promise<AdmissionDocumentTypeRow[]>;
  abstract findApplicationIdByUser(userId: string): Promise<string | null>;
  abstract findNotifications(
    applicationId: string,
  ): Promise<{ data: AdmissionNotificationRow[]; unreadCount: number }>;
  abstract findPublishedAnnouncementsForUser(
    userId: string,
  ): Promise<AdmissionAnnouncementEntity[]>;
  abstract findMyNotification(
    userId: string,
    notificationId: string,
  ): Promise<AdmissionNotificationRow | null>;
  abstract markNotificationRead(
    notificationId: string,
    readAt: Date,
  ): Promise<AdmissionNotificationRow>;
  abstract markAllNotificationsRead(userId: string): Promise<void>;
  abstract findApplicantRoleId(): Promise<string | null>;
  abstract registerApplicant(
    input: RegisterApplicantInput,
  ): Promise<ApplicationWithParentsAndUser>;
}
