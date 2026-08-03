import { AdmissionPaymentStatus } from '../../../shared/domain/enums/admission-payment-status.enum.js';
import { AdmissionStatus } from '../../../shared/domain/enums/admission-status.enum.js';
import { UserGender } from '../../../shared/domain/enums/user-gender.enum.js';
import type { AdmissionApplicationParentEntity } from './admission-application-parent.entity.js';
import type {
  AdmissionDocumentRow,
  AdmissionDocumentWithTypeAndFile,
} from './admission-document.entity.js';
import type { AdmissionPaymentWithProof } from './admission-payment.entity.js';
import type {
  ActiveWaveRow,
  AdmissionWaveEntity,
} from './admission-wave.entity.js';

export interface ReligionRef {
  id: string;
  name: string;
}

export interface AdmissionUserRef {
  id: string;
  identifier: string;
  lastLoginAt?: Date | null;
}

/**
 * Row shapes use each enum's *value union* (`` `${Enum}` ``) rather than the
 * enum itself: persistence returns plain strings, and a TS string enum is
 * nominal, so a raw `'DRAFT'` would not be assignable to it.
 */
export interface AdmissionApplicationEntity {
  id: string;
  applicantId?: string;
  waveId: string;
  status: `${AdmissionStatus}`;
  submittedAt?: Date | null;
  deletedAt?: Date | null;
}

export interface AdmissionStatusCount {
  status: string;
  count: number;
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

/** Row shape of the paginated admin application list — wave/payment are partial selects. */
export interface AdmissionApplicationListRow extends AdmissionApplicationEntity {
  registrationNumber: string;
  fullName: string;
  email: string | null;
  wave?: { id: string; name: string; code: string };
  payment?: { status: `${AdmissionPaymentStatus}` } | null;
  _count?: { documents: number };
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
