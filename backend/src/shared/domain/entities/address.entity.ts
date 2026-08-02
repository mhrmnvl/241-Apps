export interface AddressEntity {
  id: string;
  studentId?: string | null;
  teacherId?: string | null;
  parentId?: string | null;
  schoolUnitId?: string | null;
  street: string;
  rt: string;
  rw: string;
  village: string;
  district: string;
  city: string;
  province: string;
  country: string;
  postalCode: string;
  isPrimary: boolean;
  deletedAt?: Date | null;
}

/** Every column the `Address` table requires on insert. */
export interface CreateAddressRepositoryInput {
  street: string;
  rt: string;
  rw: string;
  village: string;
  district: string;
  city: string;
  province: string;
  country?: string;
  postalCode: string;
  isPrimary?: boolean;
}

export type UpdateAddressRepositoryInput =
  Partial<CreateAddressRepositoryInput>;
