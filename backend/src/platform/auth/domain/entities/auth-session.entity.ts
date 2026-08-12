import type { SessionUserRef } from './authenticated-user.entity.js';

export interface AuthSessionEntity {
  id: string;
  userId: string;
  tokenHash: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  expiresAt: Date;
  lastUsedAt: Date;
  revokedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionWithUser extends AuthSessionEntity {
  user: SessionUserRef;
}
