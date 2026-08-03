import { AddressEntity } from '../../../../shared/domain/entities/address.entity.js';
import { AddressPublic } from '../entities/profile-address.entity.js';

export type { AddressPublic };

export interface CreateProfileAddressDto {
  street: string;
  rt: string;
  rw: string;
  village: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  isPrimary?: boolean;
}

export type UpdateProfileAddressDto = Partial<CreateProfileAddressDto>;

export abstract class IProfileAddressRepository {
  abstract findAllByUserId(userId: string): Promise<AddressPublic[]>;
  abstract findAddressForUser(
    addressId: string,
    userId: string,
  ): Promise<AddressEntity | null>;

  abstract findStudentByUserId(userId: string): Promise<{ id: string } | null>;
  abstract findTeacherByUserId(userId: string): Promise<{ id: string } | null>;
  abstract clearPrimaryForStudent(
    studentId: string,
  ): Promise<{ count: number }>;
  abstract clearPrimaryForTeacher(
    teacherId: string,
  ): Promise<{ count: number }>;
  abstract clearPrimaryForStudentExclude(
    studentId: string,
    excludeId: string,
  ): Promise<{ count: number }>;

  abstract clearPrimaryForTeacherExclude(
    teacherId: string,
    excludeId: string,
  ): Promise<{ count: number }>;

  abstract create(
    dto: CreateProfileAddressDto,
    ownerId: { studentId?: string; teacherId?: string },
  ): Promise<AddressPublic>;

  abstract update(
    addressId: string,
    dto: UpdateProfileAddressDto,
  ): Promise<AddressPublic>;

  abstract remove(addressId: string): Promise<AddressEntity>;
}
