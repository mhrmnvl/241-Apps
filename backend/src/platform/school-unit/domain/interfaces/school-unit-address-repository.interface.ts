import { Address, Prisma } from '@prisma/client';

export const ADDRESS_OMIT = {
  studentId: true,
  teacherId: true,
  parentId: true,
  schoolUnitId: true,
} satisfies Prisma.AddressOmit;

export type AddressPublic = Prisma.AddressGetPayload<{
  omit: typeof ADDRESS_OMIT;
}>;

// The school-unit address is the one owned by a SchoolUnit (schoolUnitId set).
export const SCHOOL_ADDRESS_WHERE: Prisma.AddressWhereInput = {
  schoolUnitId: { not: null },
  deletedAt: null,
};

export abstract class ISchoolUnitAddressRepository {
  abstract find(): Promise<Address | null>;
  abstract create(
    dto: Prisma.AddressUncheckedCreateInput,
    schoolUnitId: string,
  ): Promise<AddressPublic>;
  abstract update(
    id: string,
    dto: Prisma.AddressUpdateInput,
  ): Promise<AddressPublic>;
  abstract remove(id: string): Promise<Address>;
}
