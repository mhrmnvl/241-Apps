import type { UserWithProfileAndRoles } from './authenticated-user.entity.js';

export interface PasswordResetTokenEntity {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date | null;
  createdAt: Date;
}

export interface PasswordResetTokenWithUser extends PasswordResetTokenEntity {
  user: UserWithProfileAndRoles;
}
