import { AdmissionDocumentStatus } from '../../../shared/domain/enums/admission-document-status.enum.js';
import type { AdmissionFileRef } from './admission-file.entity.js';

export interface AdmissionDocumentTypeRef {
  id: string;
  code: string;
  name: string;
  isRequired: boolean;
  sortOrder: number;
  isActive: boolean;
}

/** Value union, not the enum: persistence returns a plain string. */
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
