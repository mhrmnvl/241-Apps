import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { ISchoolUnitAddressRepository } from '../../domain/interfaces/school-unit-address-repository.interface.js';
import { AddressEntity } from '../../../../shared/domain/entities/address.entity.js';
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
      omit: ADDRESS_OMIT,
    });
  }

  async create(
    schoolUnitId: string,
    dto: Partial<AddressEntity>,
  ): Promise<AddressEntity> {
    const { id: _, ...data } = dto;
    return this.prisma.address.create({
      data: {
        street: data.street ?? '',
        rt: data.rt ?? '',
        rw: data.rw ?? '',
        village: data.village ?? '',
        district: data.district ?? '',
        city: data.city ?? '',
        province: data.province ?? '',
        postalCode: data.postalCode ?? '',
        isPrimary: true,
        schoolUnitId,
      },
      omit: ADDRESS_OMIT,
    });
  }

  async update(
    id: string,
    dto: Partial<AddressEntity>,
  ): Promise<AddressEntity> {
    const { id: _, ...data } = dto;
    return this.prisma.address.update({
      where: { id },
      data,
      omit: ADDRESS_OMIT,
    });
  }
}
