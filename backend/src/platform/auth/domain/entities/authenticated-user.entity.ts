/**
 * The user row a session or a reset token resolves.
 *
 * Deliberately without `passwordHash`. Only the sign-in path compares a
 * credential; validating a session and consuming a reset token do not, and
 * `findSessionWithUser` runs on every authenticated request of all five
 * applications — by a wide margin the most frequent read in the system.
 */
export interface SessionUserRef {
  id: string;
  identifier: string;
  isActive: boolean;
  deletedAt?: Date | null;
}

/** The user row auth resolves when it must verify or mint a credential. */
export interface UserWithProfileAndRoles {
  id: string;
  identifier: string;
  passwordHash: string;
  isActive: boolean;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  /** Narrowed to the name: the session reads nothing else of the profile. */
  profile?: { name: string } | null;
  userRoles?: {
    roleId: string;
    role: {
      id: string;
      code: string;
      name: string;
      /** Present on the `findUserById` path, which GET /auth/me reads. */
      rolePermissions?: { permission: { code: string } }[];
    };
  }[];
}
