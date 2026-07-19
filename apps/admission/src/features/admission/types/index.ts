export type AdmissionStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'REVISION_NEEDED'
  | 'VERIFIED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'ENROLLED'

export type AdmissionDocumentStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type AdmissionPaymentStatus =
  | 'UNPAID'
  | 'PENDING'
  | 'VERIFIED'
  | 'REJECTED'

export type AdmissionNotificationType =
  | 'STATUS_CHANGE'
  | 'DOCUMENT'
  | 'PAYMENT'
  | 'ANNOUNCEMENT'
  | 'GENERAL'

export type ParentRelation = 'FATHER' | 'MOTHER' | 'GUARDIAN'
export type UserGender = 'MALE' | 'FEMALE'

export interface AdmissionDocumentType {
  id: string
  code: string
  name: string
  isRequired: boolean
  sortOrder: number
  isActive: boolean
}

export interface AdmissionFile {
  id: string
  filename: string
  originalName: string
  mimeType: string
  sizeBytes: number
  storageKey: string
}

export interface AdmissionDocument {
  id: string
  applicationId: string
  documentTypeId: string
  fileId: string
  status: AdmissionDocumentStatus
  note: string | null
  verifiedAt: string | null
  documentType: AdmissionDocumentType
  file: AdmissionFile
}

export interface AdmissionPayment {
  id: string
  applicationId: string
  amount: number
  bankName: string | null
  senderAccountName: string | null
  transferDate: string | null
  proofFileId: string | null
  status: AdmissionPaymentStatus
  note: string | null
  proofFile: AdmissionFile | null
}

export interface AdmissionApplicationParent {
  id?: string
  relation: ParentRelation
  name: string
  nik?: string | null
  birthPlace?: string | null
  birthDate?: string | null
  phone?: string | null
  occupationId?: string | null
  educationId?: string | null
  income?: string | null
  isPrimary: boolean
  occupation?: { id: string; name: string } | null
  education?: { id: string; name: string } | null
}

export interface AdmissionWaveSummary {
  id: string
  name: string
  code: string
  academicYear?: { id: string; name: string } | string
  startDate: string
  endDate: string
  quota: number
  registrationFee: number
  description?: string | null
  isActive?: boolean
  lastRegistrationSeq?: number
  _count?: { applications: number }
}

export interface ActiveWave {
  id: string
  name: string
  code: string
  academicYear: string
  startDate: string
  endDate: string
  quota: number
  remainingQuota: number
  registrationFee: number
  description: string | null
}

export interface AdmissionApplication {
  id: string
  userId: string
  waveId: string
  registrationNumber: string
  status: AdmissionStatus
  fullName: string
  nickname: string | null
  gender: UserGender | null
  birthPlace: string | null
  birthDate: string | null
  nik: string | null
  nisn: string | null
  religionId: string | null
  phone: string | null
  email: string | null
  childOrder: number | null
  siblingCount: number | null
  street: string | null
  rt: string | null
  rw: string | null
  village: string | null
  district: string | null
  city: string | null
  province: string | null
  postalCode: string | null
  previousSchoolName: string | null
  previousSchoolNpsn: string | null
  previousSchoolAddress: string | null
  graduationYear: number | null
  submittedAt: string | null
  revisionNote: string | null
  verifiedAt: string | null
  decidedAt: string | null
  decisionNote: string | null
  enrolledAt: string | null
  createdAt: string
  wave: AdmissionWaveSummary
  parents: AdmissionApplicationParent[]
  documents: AdmissionDocument[]
  payment: AdmissionPayment | null
  documentTypes?: AdmissionDocumentType[]
  duplicateNikCount?: number
}

export interface AdmissionApplicationListItem {
  id: string
  registrationNumber: string
  status: AdmissionStatus
  fullName: string
  email: string | null
  phone: string | null
  submittedAt: string | null
  createdAt: string
  wave: { id: string; name: string; code: string }
  payment: { status: AdmissionPaymentStatus } | null
  _count: { documents: number }
}

export interface AdmissionNotification {
  id: string
  type: AdmissionNotificationType
  title: string
  message: string
  readAt: string | null
  createdAt: string
}

export interface AdmissionAnnouncement {
  id: string
  waveId: string | null
  title: string
  content: string
  isPublished: boolean
  publishedAt: string | null
  createdAt: string
  wave: { id: string; name: string; code: string } | null
}

export interface AdmissionStats {
  total: number
  byStatus: Partial<Record<AdmissionStatus, number>>
  waves: {
    id: string
    name: string
    code: string
    quota: number
    accepted: number
    quotaFillRate: number
  }[]
}

export interface RegisterPayload {
  fullName: string
  email: string
  phone?: string
  password: string
  passwordConfirm: string
  waveId: string
}

export interface UpdateApplicationPayload {
  [key: string]: unknown
  parents?: Omit<
    AdmissionApplicationParent,
    'id' | 'occupation' | 'education'
  >[]
}

export interface WaveSavePayload {
  name: string
  code: string
  academicYearId: string
  startDate: string
  endDate: string
  quota: number
  registrationFee: number
  description?: string
  isActive?: boolean
}

export interface AnnouncementSavePayload {
  title: string
  content: string
  waveId?: string
  isPublished?: boolean
}

export const STATUS_LABELS: Record<AdmissionStatus, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Menunggu Verifikasi',
  REVISION_NEEDED: 'Perlu Revisi',
  VERIFIED: 'Terverifikasi',
  ACCEPTED: 'Diterima',
  REJECTED: 'Ditolak',
  ENROLLED: 'Terdaftar sebagai Santri',
}

export const PAYMENT_STATUS_LABELS: Record<AdmissionPaymentStatus, string> = {
  UNPAID: 'Belum Bayar',
  PENDING: 'Menunggu Verifikasi',
  VERIFIED: 'Terverifikasi',
  REJECTED: 'Ditolak',
}

export const DOCUMENT_STATUS_LABELS: Record<AdmissionDocumentStatus, string> = {
  PENDING: 'Menunggu Verifikasi',
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
}

export const RELATION_LABELS: Record<ParentRelation, string> = {
  FATHER: 'Ayah',
  MOTHER: 'Ibu',
  GUARDIAN: 'Wali',
}
