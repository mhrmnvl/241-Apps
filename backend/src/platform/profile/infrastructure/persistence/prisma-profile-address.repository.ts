import { Injectable } from '@nestjs/common';
import { Address, Student, Teacher, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import {
  IProfileAddressRepository,
  AddressPublic,
  ADDRESS_OMIT,
} from '../../domain/interfaces/profile-address-repository.interface.js';

@Injectable()
export class PrismaProfileAddressRepository extends IProfileAddressRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAllByUserId(userId: string): Promise<AddressPublic[]> {
    return this.prisma.address.findMany({
      where: {
        OR: [{ student: { userId } }, { teacher: { userId } }],
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
      },
    });
  }

  async findStudentByUserId(userId: string): Promise<Student | null> {
    return this.prisma.student.findUnique({ where: { userId } });
  }

  async findTeacherByUserId(userId: string): Promise<Teacher | null> {
    return this.prisma.teacher.findUnique({ where: { userId } });
  }

  async clearPrimaryForStudent(
    studentId: string,
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.address.updateMany({
      where: { studentId, isPrimary: true },
      data: { isPrimary: false },
    });
  }

  async clearPrimaryForTeacher(
    teacherId: string,
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.address.updateMany({
      where: { teacherId, isPrimary: true },
      data: { isPrimary: false },
    });
  }

  async clearPrimaryForStudentExclude(
    studentId: string,
    excludeId: string,
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.address.updateMany({
      where: { studentId, isPrimary: true, NOT: { id: excludeId } },
      data: { isPrimary: false },
    });
  }

  async clearPrimaryForTeacherExclude(
    teacherId: string,
    excludeId: string,
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.address.updateMany({
      where: { teacherId, isPrimary: true, NOT: { id: excludeId } },
      data: { isPrimary: false },
    });
  }

  async create(
    dto: Prisma.AddressCreateWithoutStudentInput &
      Prisma.AddressCreateWithoutTeacherInput,
    ownerId: { studentId?: string; teacherId?: string },
  ): Promise<AddressPublic> {
    return this.prisma.address.create({
      // Owner is provided as a scalar FK (studentId/teacherId), which is the
      // "unchecked" create-input variant of Prisma's XOR union.
      data: { ...dto, ...ownerId } as Prisma.AddressUncheckedCreateInput,
      omit: ADDRESS_OMIT,
    });
  }

  async update(
    addressId: string,
    dto: Prisma.AddressUpdateInput,
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
