import { ConflictException } from '@nestjs/common';
import { AdmissionStatus } from '@prisma/client';

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
