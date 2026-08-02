import { Injectable } from '@nestjs/common';
import { Address, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import {
  CreateProfileAddressDto,
  IProfileAddressRepository,
  UpdateProfileAddressDto,
} from '../../domain/interfaces/profile-address-repository.interface.js';
import {
  ADDRESS_OMIT,
  AddressPublic,
} from './prisma-profile-address.includes.js';

@Injectable()
export class PrismaProfileAddressRepository implements IProfileAddressRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByUserId(userId: string): Promise<AddressPublic[]> {
    return this.prisma.address.findMany({
      where: {
        OR: [{ student: { userId } }, { teacher: { userId } }],
        deletedAt: null,
      },
      omit: ADDRESS_OMIT,
      orderBy: { isPrimary: 'desc' },
    });
  }

  async findAddressForUser(
    addressId: string,
    userId: string,
  ): Promise<Address | null> {
    return this.prisma.address.findFirst({
      where: {
        id: addressId,
        OR: [{ student: { userId } }, { teacher: { userId } }],
        deletedAt: null,
      },
    });
  }

  async findStudentByUserId(userId: string) {
    return this.prisma.student.findUnique({
      where: { userId },
      select: { id: true },
    });
  }

  async findTeacherByUserId(userId: string) {
    return this.prisma.teacher.findUnique({
      where: { userId },
      select: { id: true },
    });
  }

  async clearPrimaryForStudent(studentId: string) {
    return this.prisma.address.updateMany({
      where: { studentId, isPrimary: true },
      data: { isPrimary: false },
    });
  }

  async clearPrimaryForTeacher(teacherId: string) {
    return this.prisma.address.updateMany({
      where: { teacherId, isPrimary: true },
      data: { isPrimary: false },
    });
  }

  async clearPrimaryForStudentExclude(studentId: string, excludeId: string) {
    return this.prisma.address.updateMany({
      where: { studentId, isPrimary: true, NOT: { id: excludeId } },
      data: { isPrimary: false },
    });
  }

  async clearPrimaryForTeacherExclude(teacherId: string, excludeId: string) {
    return this.prisma.address.updateMany({
      where: { teacherId, isPrimary: true, NOT: { id: excludeId } },
      data: { isPrimary: false },
    });
  }

  async create(
    dto: CreateProfileAddressDto,
    ownerId: { studentId?: string; teacherId?: string },
  ): Promise<AddressPublic> {
    return this.prisma.address.create({
      data: {
        ...dto,
        ...(ownerId.studentId && { studentId: ownerId.studentId }),
        ...(ownerId.teacherId && { teacherId: ownerId.teacherId }),
      },
      omit: ADDRESS_OMIT,
    });
  }

  async update(
    addressId: string,
    dto: UpdateProfileAddressDto,
  ): Promise<AddressPublic> {
    return this.prisma.address.update({
      where: { id: addressId },
      data: dto,
      omit: ADDRESS_OMIT,
    });
  }

  async remove(addressId: string): Promise<Address> {
    return this.prisma.address.update({
      where: { id: addressId },
      data: { deletedAt: new Date() },
    });
  }
}
