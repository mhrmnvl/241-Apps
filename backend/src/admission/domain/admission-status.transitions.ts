import { ConflictException } from '@nestjs/common';
import { AdmissionStatus as AdmissionStatusEnum } from '../../shared/domain/enums/admission-status.enum.js';

/**
 * Value union rather than the enum itself, so statuses read back from
 * persistence (plain strings) flow through the state machine unchanged.
 */
type AdmissionStatus = `${AdmissionStatusEnum}`;

const ALLOWED_TRANSITIONS: Record<AdmissionStatus, AdmissionStatus[]> = {
  DRAFT: ['SUBMITTED'],
  SUBMITTED: ['REVISION_NEEDED', 'VERIFIED', 'REJECTED'],
  REVISION_NEEDED: ['SUBMITTED'],
  VERIFIED: ['ACCEPTED', 'REJECTED'],
  ACCEPTED: ['ENROLLED'],
  REJECTED: [],
  ENROLLED: [],
};

export const EDITABLE_STATUSES: AdmissionStatus[] = [
  'DRAFT',
  'REVISION_NEEDED',
];

export function assertTransition(
  from: AdmissionStatus,
  to: AdmissionStatus,
): void {
  if (!ALLOWED_TRANSITIONS[from].includes(to)) {
    throw new ConflictException(`Transisi status tidak valid: ${from} → ${to}`);
  }
}

export function isEditable(status: AdmissionStatus): boolean {
  return EDITABLE_STATUSES.includes(status);
}
