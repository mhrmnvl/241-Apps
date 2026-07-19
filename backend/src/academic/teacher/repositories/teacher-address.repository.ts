import { Prisma } from '@prisma/client';

export { PrismaTeacherAddressRepository as TeacherAddressRepository } from '../infrastructure/persistence/prisma-teacher-address.repository.js';

export const ADDRESS_OMIT = {
  studentId: true,
  teacherId: true,
  parentId: true,
} satisfies Prisma.AddressOmit;
