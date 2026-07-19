import { Address, Student, Teacher, Prisma } from '@prisma/client';

export const ADDRESS_OMIT = {
  studentId: true,
  teacherId: true,
  parentId: true,
} satisfies Prisma.AddressOmit;

export type AddressPublic = Prisma.AddressGetPayload<{
  omit: typeof ADDRESS_OMIT;
}>;

export abstract class IProfileAddressRepository {
  abstract findAllByUserId(userId: string): Promise<AddressPublic[]>;
  abstract findAddressForUser(
    addressId: string,
    userId: string,
  ): Promise<Address | null>;

  abstract findStudentByUserId(userId: string): Promise<Student | null>;
  abstract findTeacherByUserId(userId: string): Promise<Teacher | null>;
  abstract clearPrimaryForStudent(
    studentId: string,
  ): Promise<Prisma.BatchPayload>;
  abstract clearPrimaryForTeacher(
    teacherId: string,
  ): Promise<Prisma.BatchPayload>;
  abstract clearPrimaryForStudentExclude(
    studentId: string,
    excludeId: string,
  ): Promise<Prisma.BatchPayload>;

  abstract clearPrimaryForTeacherExclude(
    teacherId: string,
    excludeId: string,
  ): Promise<Prisma.BatchPayload>;

  abstract create(
    dto: Prisma.AddressCreateWithoutStudentInput &
      Prisma.AddressCreateWithoutTeacherInput,
    ownerId: { studentId?: string; teacherId?: string },
  ): Promise<AddressPublic>;

  abstract update(
    addressId: string,
    dto: Prisma.AddressUpdateInput,
  ): Promise<AddressPublic>;

  abstract remove(addressId: string): Promise<Address>;
}
