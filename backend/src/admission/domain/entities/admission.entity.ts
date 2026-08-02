import { DecimalValue } from '../../../shared/domain/types/decimal.type.js';
import { AdmissionDocumentStatus } from '../../../shared/domain/enums/admission-document-status.enum.js';
import { AdmissionPaymentStatus } from '../../../shared/domain/enums/admission-payment-status.enum.js';
import { AdmissionStatus } from '../../../shared/domain/enums/admission-status.enum.js';
import { IncomeRange } from '../../../shared/domain/enums/income-range.enum.js';
import { ParentRelation } from '../../../shared/domain/enums/parent-relation.enum.js';
import { UserGender } from '../../../shared/domain/enums/user-gender.enum.js';

/**
 * Row shapes use each enum's *value union* (`` `${Enum}` ``) rather than the
 * enum itself: persistence returns plain strings, and a TS string enum is
 * nominal, so a raw `'DRAFT'` would not be assignable to it.
 */
export interface AcademicYearRef {
  id: string;
  name: string;
  isActive: boolean;
  deletedAt: Date | null;
}

export interface ReligionRef {
  id: string;
  name: string;
}

export interface OccupationRef {
  id: string;
  name: string;
}

export interface EducationRef {
  id: string;
  name: string;
}

export interface AdmissionFileRef {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
}

export interface AdmissionUserRef {
  id: string;
  identifier: string;
  lastLoginAt?: Date | null;
}

export interface AdmissionWaveEntity {
  id: string;
  academicYearId: string;
  code: string;
  name: string;
  startDate: Date;
  endDate: Date;
  quota: number;
  registrationFee: DecimalValue;
  description: string | null;
  isActive: boolean;
  lastRegistrationSeq: number;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdmissionApplicantEntity {
  id: string;
  userId: string;
  registrationNumber: string;
  status: `${AdmissionStatus}`;
  deletedAt?: Date | null;
}

export interface AdmissionApplicationEntity {
  id: string;
  applicantId?: string;
  waveId: string;
  status: `${AdmissionStatus}`;
  submittedAt?: Date | null;
  deletedAt?: Date | null;
}

export interface AdmissionAnnouncementEntity {
  id: string;
  title: string;
  content: string;
  publishDate?: Date;
  publishedAt?: Date | null;
  waveId: string | null;
  isPublished?: boolean;
  deletedAt?: Date | null;
}

export interface AdmissionDocumentTypeRef {
  id: string;
  code: string;
  name: string;
  isRequired: boolean;
  sortOrder: number;
  isActive: boolean;
}

export interface AdmissionDocumentRow {
  id: string;
  applicationId: string;
  documentTypeId: string;
  fileId?: string | null;
  status: `${AdmissionDocumentStatus}`;
  note?: string | null;
  verifiedById?: string | null;
  verifiedAt?: Date | null;
}

/** Document row from a query that joins the document type. */
export interface AdmissionDocumentWithType extends AdmissionDocumentRow {
  documentType: AdmissionDocumentTypeRef;
}

export interface AdmissionDocumentWithTypeAndFile extends AdmissionDocumentWithType {
  file?: AdmissionFileRef | null;
}

export interface AdmissionPaymentWithProof {
  id: string;
  applicationId: string;
  amount: DecimalValue;
  status: `${AdmissionPaymentStatus}`;
  proofFileId: string | null;
  proofFile?: AdmissionFileRef | null;
  note: string | null;
  bankName: string | null;
  senderAccountName: string | null;
  transferDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  verifiedById: string | null;
  verifiedAt: Date | null;
}

export interface AdmissionApplicationParentEntity {
  id: string;
  applicationId: string;
  relation: `${ParentRelation}`;
  name: string;
  nik: string | null;
  birthPlace: string | null;
  birthDate: Date | null;
  phone: string | null;
  occupationId: string | null;
  educationId: string | null;
  income: `${IncomeRange}` | null;
  isPrimary: boolean;
  occupation?: OccupationRef | null;
  education?: EducationRef | null;
}

export interface AdmissionStatusCount {
  status: string;
  count: number;
}

export interface AdmissionWaveAcceptedCount {
  waveId?: string;
  count?: number;
  id?: string;
  name?: string;
  code?: string;
  quota: number;
  accepted: number;
  fillRate?: number;
}

export interface ApplicationWithDocsAndPayment extends AdmissionApplicationEntity {
  documents?: AdmissionDocumentRow[];
  payment?: AdmissionPaymentWithProof | null;
  wave?: ActiveWaveRow;
  parents?: AdmissionApplicationParentEntity[];
}

export interface ApplicationWithParentsAndUser extends AdmissionApplicationEntity {
  userId: string;
  fullName?: string;
  nickname?: string | null;
  nik?: string | null;
  gender?: `${UserGender}` | null;
  birthPlace?: string | null;
  birthDate?: Date | null;
  nisn?: string | null;
  email?: string | null;
  phone?: string | null;
  religionId?: string | null;
  religion?: ReligionRef | null;
  registrationNumber?: string;
  childOrder?: number | null;
  siblingCount?: number | null;
  previousSchoolName?: string | null;
  previousSchoolNpsn?: string | null;
  previousSchoolAddress?: string | null;
  graduationYear?: number | null;
  revisionNote?: string | null;
  user?: AdmissionUserRef;
  wave?: ActiveWaveRow;
  documents?: AdmissionDocumentWithTypeAndFile[];
  payment?: AdmissionPaymentWithProof | null;
  parents?: AdmissionApplicationParentEntity[];
  street?: string | null;
  rt?: string | null;
  rw?: string | null;
  village?: string | null;
  district?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
}

export interface ApplicationWithWave extends AdmissionApplicationEntity {
  /** Always resolved; the join fetches the wave without its academic year. */
  wave: AdmissionWaveEntity;
}

export interface EnrolledStudentRef {
  id: string;
  userId: string;
  nis: string;
  nisn: string;
  gradeId: string | null;
}

export interface EnrollResult {
  application: AdmissionApplicationEntity;
  student: EnrolledStudentRef;
  parentsLinked: number;
  enrollmentCreated: boolean;
}

export interface ActiveWaveRow extends AdmissionWaveEntity {
  /** Always resolved — every query returning this row includes the academic year. */
  academicYear: AcademicYearRef;
  _count?: {
    applications?: number;
  };
}

/** Row shape of the paginated admin application list — wave/payment are partial selects. */
export interface AdmissionApplicationListRow extends AdmissionApplicationEntity {
  registrationNumber: string;
  fullName: string;
  email: string | null;
  wave?: { id: string; name: string; code: string };
  payment?: { status: `${AdmissionPaymentStatus}` } | null;
  _count?: { documents: number };
}
