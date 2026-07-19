import { Address, Prisma } from '@prisma/client';
import {
  CreateAddressDto,
  UpdateAddressDto,
} from '../../../../shared/dto/address.dto.js';

export abstract class IStudentAddressRepository {
  abstract findAll(studentId: string): Promise<Address[]>;
  abstract findOne(
    studentId: string,
    addressId: string,
  ): Promise<Address | null>;
  abstract clearPrimary(studentId: string): Promise<Prisma.BatchPayload>;
  abstract clearPrimaryExclude(
    studentId: string,
    excludeId: string,
  ): Promise<Prisma.BatchPayload>;
  abstract create(studentId: string, dto: CreateAddressDto): Promise<Address>;
  abstract update(addressId: string, dto: UpdateAddressDto): Promise<Address>;
  abstract remove(addressId: string): Promise<Address>;
}
