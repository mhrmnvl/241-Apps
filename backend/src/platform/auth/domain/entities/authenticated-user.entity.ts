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
  profile?: { id: string; userId: string; name: string } | null;
  userRoles?: {
    roleId: string;
    role: { id: string; code: string; name: string };
  }[];
}
