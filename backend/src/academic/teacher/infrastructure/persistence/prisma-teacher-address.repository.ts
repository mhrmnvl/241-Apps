import { Injectable } from '@nestjs/common';
import { Address } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { ITeacherAddressRepository } from '../../domain/interfaces/teacher-address-repository.interface.js';
import {
  CreateAddressDto,
  UpdateAddressDto,
} from '../../../../shared/dto/address.dto.js';

@Injectable()
export class PrismaTeacherAddressRepository extends ITeacherAddressRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(teacherId: string): Promise<Address[]> {
    return this.prisma.address.findMany({
      where: { teacherId },
      orderBy: { isPrimary: 'desc' },
    });
  }

  async findById(
    teacherId: string,
    addressId: string,
  ): Promise<Address | null> {
    return this.prisma.address.findFirst({
      where: { id: addressId, teacherId },
    });
  }

  async create(teacherId: string, dto: CreateAddressDto): Promise<Address> {
    return this.prisma.$transaction(async (tx) => {
      if (dto.isPrimary) {
        await tx.address.updateMany({
          where: { teacherId, isPrimary: true },
          data: { isPrimary: false },
        });
      }
      return tx.address.create({
        data: { ...dto, teacherId },
      });
    });
  }

  async update(
    teacherId: string,
    addressId: string,
    dto: UpdateAddressDto,
  ): Promise<Address> {
    return this.prisma.$transaction(async (tx) => {
      if (dto.isPrimary) {
        await tx.address.updateMany({
          where: { teacherId, isPrimary: true, NOT: { id: addressId } },
          data: { isPrimary: false },
        });
      }
      return tx.address.update({
        where: { id: addressId },
        data: dto,
      });
    });
  }

  async remove(addressId: string): Promise<Address> {
    return this.prisma.address.update({
      where: { id: addressId },
      data: { deletedAt: new Date() },
    });
  }
}
