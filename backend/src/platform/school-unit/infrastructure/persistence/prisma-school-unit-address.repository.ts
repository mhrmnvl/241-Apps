import { Injectable } from '@nestjs/common';
import { Address, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import {
  ISchoolUnitAddressRepository,
  AddressPublic,
  ADDRESS_OMIT,
  SCHOOL_ADDRESS_WHERE,
} from '../../domain/interfaces/school-unit-address-repository.interface.js';

@Injectable()
export class PrismaSchoolUnitAddressRepository extends ISchoolUnitAddressRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async find(): Promise<Address | null> {
    return this.prisma.address.findFirst({
      where: SCHOOL_ADDRESS_WHERE,
    });
  }

  async create(
    dto: Prisma.AddressUncheckedCreateInput,
    schoolUnitId: string,
  ): Promise<AddressPublic> {
    return this.prisma.address.create({
      data: { ...dto, isPrimary: true, schoolUnitId },
      omit: ADDRESS_OMIT,
    });
  }

  async update(
    id: string,
    dto: Prisma.AddressUpdateInput,
  ): Promise<AddressPublic> {
    return this.prisma.address.update({
      where: { id },
      data: dto,
      omit: ADDRESS_OMIT,
    });
  }

  async remove(id: string): Promise<Address> {
    return this.prisma.address.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
