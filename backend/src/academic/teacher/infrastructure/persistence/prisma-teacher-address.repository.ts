import { Injectable } from '@nestjs/common';
import { Address } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import {
  CreateAddressRepositoryInput,
  ITeacherAddressRepository,
  UpdateAddressRepositoryInput,
} from '../../domain/interfaces/teacher-address-repository.interface.js';

@Injectable()
export class PrismaTeacherAddressRepository extends ITeacherAddressRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findByTeacherId(teacherId: string): Promise<Address[]> {
    return this.prisma.address.findMany({
      where: { teacherId },
      orderBy: { isPrimary: 'desc' },
    });
  }

  async findAll(teacherId: string): Promise<Address[]> {
    return this.findByTeacherId(teacherId);
  }

  async findById(
    teacherId: string,
    addressId: string,
  ): Promise<Address | null> {
    return this.prisma.address.findFirst({
      where: { id: addressId, teacherId },
    });
  }

  async create(
    teacherId: string,
    dto: CreateAddressRepositoryInput,
  ): Promise<Address> {
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
    dto: UpdateAddressRepositoryInput,
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

  async softDelete(teacherId: string, addressId: string): Promise<Address> {
    return this.prisma.address.update({
      where: { id: addressId },
      data: { deletedAt: new Date() },
    });
  }

  async remove(addressId: string): Promise<Address> {
    return this.prisma.address.update({
      where: { id: addressId },
      data: { deletedAt: new Date() },
    });
  }
}
