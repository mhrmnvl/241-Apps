import { Prisma } from '@prisma/client';

export type UserRoleWithRole = Prisma.UserRoleGetPayload<{
  include: { role: true };
}>;
