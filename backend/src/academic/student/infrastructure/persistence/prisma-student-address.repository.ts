import { Injectable } from '@nestjs/common';
import { Address, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import {
  CreateAddressDto,
  UpdateAddressDto,
} from '../../../../shared/dto/address.dto.js';
import { IStudentAddressRepository } from '../../domain/interfaces/student-address-repository.interface.js';

@Injectable()
export class PrismaStudentAddressRepository extends IStudentAddressRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(studentId: string): Promise<Address[]> {
    return this.prisma.address.findMany({
      where: { studentId },
      orderBy: { isPrimary: 'desc' },
    });
  }

  async findOne(studentId: string, addressId: string): Promise<Address | null> {
    return this.prisma.address.findFirst({
      where: { id: addressId, studentId },
    });
  }

  async clearPrimary(studentId: string): Promise<Prisma.BatchPayload> {
    return this.prisma.address.updateMany({
      where: { studentId, isPrimary: true },
      data: { isPrimary: false },
    });
  }

  async clearPrimaryExclude(
    studentId: string,
    excludeId: string,
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.address.updateMany({
      where: { studentId, isPrimary: true, NOT: { id: excludeId } },
      data: { isPrimary: false },
    });
  }

  async create(studentId: string, dto: CreateAddressDto): Promise<Address> {
    return this.prisma.address.create({
      data: { ...dto, studentId },
    });
  }

  async update(addressId: string, dto: UpdateAddressDto): Promise<Address> {
    return this.prisma.address.update({
      where: { id: addressId },
      data: dto,
    });
  }

  async remove(addressId: string): Promise<Address> {
    return this.prisma.address.update({
      where: { id: addressId },
      data: { deletedAt: new Date() },
    });
  }
}
