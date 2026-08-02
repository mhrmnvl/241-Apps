import { Prisma } from '@prisma/client';

export const PUBLIC_USER_SELECT = {
  id: true,
  identifier: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  userRoles: {
    select: {
      role: true,
    },
  },
  profile: {
    select: {
      name: true,
    },
  },
} satisfies Prisma.UserSelect;

export type UserPublic = Prisma.UserGetPayload<{
  select: typeof PUBLIC_USER_SELECT;
}>;
