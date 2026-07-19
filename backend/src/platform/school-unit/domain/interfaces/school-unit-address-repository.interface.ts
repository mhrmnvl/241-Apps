import { Address, Prisma } from '@prisma/client';

export const ADDRESS_OMIT = {
  studentId: true,
  teacherId: true,
  parentId: true,
} satisfies Prisma.AddressOmit;

export type AddressPublic = Prisma.AddressGetPayload<{
  omit: typeof ADDRESS_OMIT;
}>;

export const SCHOOL_ADDRESS_WHERE: Prisma.AddressWhereInput = {
  studentId: null,
  teacherId: null,
  parentId: null,
  deletedAt: null,
};

export abstract class ISchoolUnitAddressRepository {
  abstract find(): Promise<Address | null>;
  abstract create(dto: Prisma.AddressCreateInput): Promise<AddressPublic>;
  abstract update(
    id: string,
    dto: Prisma.AddressUpdateInput,
  ): Promise<AddressPublic>;
  abstract remove(id: string): Promise<Address>;
}
