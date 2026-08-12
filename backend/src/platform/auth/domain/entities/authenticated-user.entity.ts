/** The user row auth resolves alongside a session or reset token. */
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
