import { Injectable } from '@nestjs/common';
import { Address, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { IStudentAddressRepository } from '../../domain/interfaces/student-address-repository.interface.js';
import { AddressEntity } from '../../../../shared/domain/entities/address.entity.js';

@Injectable()
export class PrismaStudentAddressRepository extends IStudentAddressRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findByStudentId(studentId: string): Promise<AddressEntity[]> {
    return this.prisma.address.findMany({
      where: { studentId },
      orderBy: { isPrimary: 'desc' },
    });
  }

  async findAll(studentId: string): Promise<AddressEntity[]> {
    return this.findByStudentId(studentId);
  }

  async findById(id: string): Promise<AddressEntity | null> {
    return this.prisma.address.findFirst({
      where: { id },
    });
  }

  async findOne(
    studentId: string,
    addressId: string,
  ): Promise<AddressEntity | null> {
    return this.prisma.address.findFirst({
      where: { id: addressId, studentId },
    });
  }

  async create(
    studentId: string,
    dto: Partial<AddressEntity>,
  ): Promise<AddressEntity> {
    return this.prisma.$transaction(async (tx) => {
      if (dto.isPrimary) {
        await tx.address.updateMany({
          where: { studentId, isPrimary: true },
          data: { isPrimary: false },
        });
      }
      return tx.address.create({
        data: {
          ...(dto as unknown as Prisma.AddressUncheckedCreateInput),
          studentId,
        },
      });
    });
  }

  async update(
    id: string,
    dto: Partial<AddressEntity>,
  ): Promise<AddressEntity> {
    return this.prisma.$transaction(async (tx) => {
      if (dto.isPrimary) {
        const current = await tx.address.findUnique({ where: { id } });
        if (current?.studentId) {
          await tx.address.updateMany({
            where: {
              studentId: current.studentId,
              isPrimary: true,
              NOT: { id },
            },
            data: { isPrimary: false },
          });
        }
      }
      return tx.address.update({
        where: { id },
        data: dto,
      });
    });
  }

  async remove(id: string): Promise<AddressEntity> {
    return this.prisma.address.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async clearPrimaryForStudent(
    studentId: string,
    excludeId?: string,
  ): Promise<{ count: number }> {
    return this.prisma.address.updateMany({
      where: {
        studentId,
        isPrimary: true,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
      data: { isPrimary: false },
    });
  }

  async clearPrimaryExclude(
    studentId: string,
    excludeAddressId: string,
  ): Promise<{ count: number }> {
    return this.clearPrimaryForStudent(studentId, excludeAddressId);
  }

  async clearPrimary(studentId: string): Promise<{ count: number }> {
    return this.clearPrimaryForStudent(studentId);
  }
}
