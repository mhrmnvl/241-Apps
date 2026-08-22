import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { ISchoolUnitAddressRepository } from '../../domain/interfaces/school-unit-address-repository.interface.js';
import {
  AddressEntity,
  CreateAddressRepositoryInput,
  UpdateAddressRepositoryInput,
} from '../../../../shared/domain/entities/address.entity.js';
import { ADDRESS_OMIT } from '../../../profile/infrastructure/persistence/prisma-profile-address.includes.js';

@Injectable()
export class PrismaSchoolUnitAddressRepository extends ISchoolUnitAddressRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findBySchoolUnitId(
    schoolUnitId: string,
  ): Promise<AddressEntity | null> {
    return this.prisma.address.findFirst({
      where: { schoolUnitId, deletedAt: null },
      // `create` below marks every school address primary, so today this only
      // makes explicit what was already true. It matters because the profile
      // map reads the coordinate off whatever this returns: were a second
      // address ever to appear, "first row the database felt like" would move
      // the pin, and ordering makes that a decision rather than an accident.
      orderBy: [{ isPrimary: 'desc' }, { id: 'asc' }],
      omit: ADDRESS_OMIT,
    });
  }

  async create(
    schoolUnitId: string,
    input: CreateAddressRepositoryInput,
  ): Promise<AddressEntity> {
    return this.prisma.address.create({
      data: {
        street: input.street,
        rt: input.rt,
        rw: input.rw,
        village: input.village,
        district: input.district,
        city: input.city,
        province: input.province,
        postalCode: input.postalCode,
        // Undefined leaves the column default in place.
        country: input.country,
        latitude: input.latitude,
        longitude: input.longitude,
        // A school unit has exactly one address, so it is always the primary.
        isPrimary: true,
        schoolUnitId,
      },
      omit: ADDRESS_OMIT,
    });
  }

  async update(
    id: string,
    input: UpdateAddressRepositoryInput,
  ): Promise<AddressEntity> {
    return this.prisma.address.update({
      where: { id },
      // `isPrimary` is deliberately absent: a school unit has exactly one
      // address, so it is always primary and must not be demoted.
      data: {
        street: input.street,
        rt: input.rt,
        rw: input.rw,
        village: input.village,
        district: input.district,
        city: input.city,
        province: input.province,
        postalCode: input.postalCode,
        country: input.country,
        latitude: input.latitude,
        longitude: input.longitude,
      },
      omit: ADDRESS_OMIT,
    });
  }

  async softDelete(id: string): Promise<AddressEntity> {
    return this.prisma.address.update({
      where: { id },
      data: { deletedAt: new Date() },
      omit: ADDRESS_OMIT,
    });
  }
}
