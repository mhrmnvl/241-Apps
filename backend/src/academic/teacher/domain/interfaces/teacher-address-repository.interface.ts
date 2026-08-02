import {
  AddressEntity,
  CreateAddressRepositoryInput,
  UpdateAddressRepositoryInput,
} from '../../../../shared/domain/entities/address.entity.js';

export type { CreateAddressRepositoryInput, UpdateAddressRepositoryInput };

export abstract class ITeacherAddressRepository {
  abstract findByTeacherId(teacherId: string): Promise<AddressEntity[]>;
  abstract findById(
    teacherId: string,
    addressId: string,
  ): Promise<AddressEntity | null>;
  abstract create(
    teacherId: string,
    input: CreateAddressRepositoryInput,
  ): Promise<AddressEntity>;
  abstract update(
    teacherId: string,
    addressId: string,
    input: UpdateAddressRepositoryInput,
  ): Promise<AddressEntity>;
  abstract softDelete(
    teacherId: string,
    addressId: string,
  ): Promise<AddressEntity>;
}
