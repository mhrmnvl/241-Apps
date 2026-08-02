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

export interface PasswordResetTokenEntity {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date | null;
  createdAt: Date;
}

export interface UserWithProfileAndRoles {
  id: string;
  identifier: string;
  passwordHash: string;
  isActive: boolean;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  profile?: { id: string; userId: string; name: string } | null;
  userRoles?: {
    roleId: string;
    role: { id: string; code: string; name: string };
  }[];
}

export interface SessionWithUser extends AuthSessionEntity {
  user: UserWithProfileAndRoles;
}

export interface PasswordResetTokenWithUser extends PasswordResetTokenEntity {
  user: UserWithProfileAndRoles;
}
