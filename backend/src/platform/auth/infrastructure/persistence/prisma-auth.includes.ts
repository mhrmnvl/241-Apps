import { Prisma } from '@prisma/client';

export type UserWithProfileAndRoles = Prisma.UserGetPayload<{
  include: {
    profile: true;
    userRoles: { include: { role: true } };
  };
}>;

export type SessionWithUser = Prisma.AuthSessionGetPayload<{
  include: { user: true };
}>;

export type PasswordResetTokenWithUser = Prisma.PasswordResetTokenGetPayload<{
  include: { user: true };
}>;
