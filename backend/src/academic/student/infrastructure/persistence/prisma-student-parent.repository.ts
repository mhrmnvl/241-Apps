import { Injectable } from '@nestjs/common';
import { Prisma, StudentParent } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import type {
  CreateStudentParentRepositoryInput,
  UpdateStudentParentRepositoryInput,
} from '../../domain/interfaces/student-parent-repository.interface.js';
import { IStudentParentRepository } from '../../domain/interfaces/student-parent-repository.interface.js';
import {
  STUDENT_PARENT_INCLUDE,
  StudentParentWithDetails,
} from './prisma-student-parent.includes.js';

@Injectable()
export class PrismaStudentParentRepository extends IStudentParentRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findByStudentId(
    studentId: string,
  ): Promise<StudentParentWithDetails[]> {
    return this.prisma.studentParent.findMany({
      where: {
        studentId,
        student: { deletedAt: null },
        parent: { deletedAt: null },
      },
      include: STUDENT_PARENT_INCLUDE,
      orderBy: [{ isPrimary: 'desc' }, { relation: 'asc' }],
    });
  }

  async findAll(studentId: string): Promise<StudentParentWithDetails[]> {
    return this.findByStudentId(studentId);
  }

  async findById(id: string): Promise<StudentParentWithDetails | null> {
    return this.prisma.studentParent.findFirst({
      where: {
        id,
        student: { deletedAt: null },
        parent: { deletedAt: null },
      },
      include: STUDENT_PARENT_INCLUDE,
    });
  }

  async findByStudentAndParent(
    studentId: string,
    parentId: string,
  ): Promise<StudentParentWithDetails | null> {
    return this.prisma.studentParent.findUnique({
      where: { studentId_parentId: { studentId, parentId } },
      include: STUDENT_PARENT_INCLUDE,
    });
  }

  async findPair(
    studentId: string,
    parentId: string,
  ): Promise<StudentParentWithDetails | null> {
    return this.findByStudentAndParent(studentId, parentId);
  }

  async findStudent(id: string): Promise<{ id: string } | null> {
    return this.prisma.student.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });
  }

  async findParent(id: string): Promise<{ id: string } | null> {
    return this.prisma.parent.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });
  }

  async create(
    dto: CreateStudentParentRepositoryInput,
  ): Promise<StudentParentWithDetails> {
    return this.prisma.$transaction(async (tx) => {
      if (dto.isPrimary) {
        await tx.studentParent.updateMany({
          where: { studentId: dto.studentId, isPrimary: true },
          data: { isPrimary: false },
        });
      }
      return tx.studentParent.create({
        data: {
          studentId: dto.studentId,
          parentId: dto.parentId,
          relation: dto.relation,
          isPrimary: dto.isPrimary ?? false,
        },
        include: STUDENT_PARENT_INCLUDE,
      });
    });
  }

  async update(
    id: string,
    dtoOrStudentId: UpdateStudentParentRepositoryInput | string,
    studentIdArg?: string,
  ): Promise<StudentParentWithDetails> {
    const dto =
      typeof dtoOrStudentId === 'string'
        ? (studentIdArg as unknown as UpdateStudentParentRepositoryInput)
        : dtoOrStudentId;
    const studentId =
      typeof dtoOrStudentId === 'string' ? dtoOrStudentId : studentIdArg;

    return this.prisma.$transaction(async (tx) => {
      if (dto?.isPrimary && studentId) {
        await tx.studentParent.updateMany({
          where: { studentId, isPrimary: true, NOT: { id } },
          data: { isPrimary: false },
        });
      }
      return tx.studentParent.update({
        where: { id },
        data: dto,
        include: STUDENT_PARENT_INCLUDE,
      });
    });
  }

  async remove(id: string): Promise<StudentParentWithDetails> {
    return this.prisma.studentParent.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: STUDENT_PARENT_INCLUDE,
    });
  }

  async clearPrimaryForStudent(
    studentId: string,
    excludeId?: string,
  ): Promise<{ count: number }> {
    return this.prisma.studentParent.updateMany({
      where: {
        studentId,
        isPrimary: true,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      data: { isPrimary: false },
    });
  }
}
