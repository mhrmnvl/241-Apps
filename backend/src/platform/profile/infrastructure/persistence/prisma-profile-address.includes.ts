import { Prisma } from '@prisma/client';

export const ADDRESS_OMIT = {
  studentId: true,
  teacherId: true,
  parentId: true,
} satisfies Prisma.AddressOmit;

export type AddressPublic = Prisma.AddressGetPayload<{
  omit: typeof ADDRESS_OMIT;
}>;
