import { Address } from '@prisma/client';
import {
  CreateAddressDto,
  UpdateAddressDto,
} from '../../../../shared/dto/address.dto.js';

export abstract class ITeacherAddressRepository {
  abstract findAll(teacherId: string): Promise<Address[]>;
  abstract findById(
    teacherId: string,
    addressId: string,
  ): Promise<Address | null>;
  abstract create(teacherId: string, dto: CreateAddressDto): Promise<Address>;
  abstract update(
    teacherId: string,
    addressId: string,
    dto: UpdateAddressDto,
  ): Promise<Address>;
  abstract remove(addressId: string): Promise<Address>;
}
