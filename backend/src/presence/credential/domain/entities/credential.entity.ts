import { CredentialStatus, PresenceSubjectType } from '@prisma/client';

/** Value unions rather than the enums: persistence returns plain strings. */
export type CredentialStatusEnum = `${CredentialStatus}`;
export type PresenceSubjectTypeEnum = `${PresenceSubjectType}`;

export interface CredentialEntity {
  id: string;
  userId: string;
  subjectType: PresenceSubjectTypeEnum;
  status: CredentialStatusEnum;
  issuedAt: Date;
  issuedBy?: string | null;
  revokedAt?: Date | null;
  revokedReason?: string | null;
  replacedById?: string | null;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CredentialHolderRef {
  id: string;
  identifier: string;
  displayName: string | null;
  photoUrl: string | null;
}

export interface CredentialWithHolder extends CredentialEntity {
  holder: CredentialHolderRef;
}

/**
 * The only shape that carries `code`. Returned by issue, replace, and the print
 * payload, and by nothing else — a list or detail response leaking the code
 * would make every card copyable from a screen someone left open.
 */
export interface CredentialWithCode extends CredentialWithHolder {
  code: string;
}

/**
 * What the scan path needs. Narrow on purpose: resolving a scanned code must not
 * pull a holder's whole profile into the hot path.
 */
export interface CredentialResolution {
  id: string;
  userId: string;
  subjectType: PresenceSubjectTypeEnum;
  status: CredentialStatusEnum;
  holderIsActive: boolean;
  displayName: string | null;
  photoUrl: string | null;
}
