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
  /** WGS84. Null on every address nobody has pinned, which is most of them. */
  latitude?: number | null;
  longitude?: number | null;
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
  /**
   * Both or neither. Half a coordinate is not a place, so the use case rejects
   * one without the other rather than storing a row that can never be mapped.
   */
  latitude?: number | null;
  longitude?: number | null;
}

export type UpdateAddressRepositoryInput =
  Partial<CreateAddressRepositoryInput>;
