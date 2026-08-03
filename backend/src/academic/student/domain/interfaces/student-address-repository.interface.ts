import {
  AddressEntity,
  CreateAddressRepositoryInput,
  UpdateAddressRepositoryInput,
} from '../../../../shared/domain/entities/address.entity.js';

export abstract class IStudentAddressRepository {
  abstract findByStudentId(studentId: string): Promise<AddressEntity[]>;
  abstract findAll(studentId: string): Promise<AddressEntity[]>;
  abstract findById(id: string): Promise<AddressEntity | null>;
  abstract findOne(
    studentId: string,
    addressId: string,
  ): Promise<AddressEntity | null>;
  abstract create(
    studentId: string,
    input: CreateAddressRepositoryInput,
  ): Promise<AddressEntity>;
  abstract update(
    id: string,
    input: UpdateAddressRepositoryInput,
  ): Promise<AddressEntity>;
  abstract remove(id: string): Promise<AddressEntity>;
  abstract clearPrimaryForStudent(
    studentId: string,
    excludeId?: string,
  ): Promise<{ count: number }>;
  abstract clearPrimaryExclude(
    studentId: string,
    excludeAddressId: string,
  ): Promise<{ count: number }>;
  abstract clearPrimary(studentId: string): Promise<{ count: number }>;
}
