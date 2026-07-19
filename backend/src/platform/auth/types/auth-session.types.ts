export interface CreateSessionData {
  id: string;
  userId: string;
  tokenHash: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
}
export interface UpdateSessionTokenData {
  tokenHash: string;
  lastUsedAt: Date;
  expiresAt: Date;
}
