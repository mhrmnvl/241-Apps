export interface DeviceEntity {
  id: string;
  name: string;
  location?: string | null;
  isActive: boolean;
  lastSeenAt?: Date | null;
  tokenIssuedAt: Date;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * What the `DeviceGuard` needs to decide whether a token may ingest scans.
 * Deliberately narrow — `tokenHash` never reaches a response DTO.
 */
export interface DeviceAuthContext {
  id: string;
  name: string;
  isActive: boolean;
}
