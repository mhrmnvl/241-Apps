import { Injectable } from '@nestjs/common';
import { Prisma, StudentParent } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { CreateStudentParentDto } from '../../dto/request/create-student-parent.dto.js';
import { StudentParentQueryDto } from '../../dto/request/student-parent-query.dto.js';
import { UpdateStudentParentDto } from '../../dto/request/update-student-parent.dto.js';
import {
  IStudentParentRepository,
  STUDENT_PARENT_INCLUDE,
  StudentParentWithDetails,
  StudentReference,
  ParentReference,
} from '../../domain/interfaces/student-parent-repository.interface.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

@Injectable()
export class PrismaStudentParentRepository extends IStudentParentRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(
    query: StudentParentQueryDto,
  ): Promise<PaginatedResult<StudentParentWithDetails>> {
    const {
      page = 1,
      limit = 10,
      search,
      studentId,
      parentId,
      relation,
      isPrimary,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.StudentParentWhereInput = {
      student: { deletedAt: null },
      parent: { deletedAt: null },
      ...(studentId && { studentId }),
      ...(parentId && { parentId }),
      ...(relation && { relation }),
      ...(isPrimary !== undefined && { isPrimary }),
      ...(search && {
        OR: [
          { student: { nis: { contains: search, mode: 'insensitive' } } },
          { student: { nisn: { contains: search, mode: 'insensitive' } } },
          {
            student: {
              user: {
                profile: { name: { contains: search, mode: 'insensitive' } },
              },
            },
          },
          { parent: { name: { contains: search, mode: 'insensitive' } } },
          { parent: { nik: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.studentParent.findMany({
        where,
        include: STUDENT_PARENT_INCLUDE,
        skip,
        take: limit,
        orderBy: [{ isPrimary: 'desc' }, { relation: 'asc' }],
      }),
      this.prisma.studentParent.count({ where }),
    ]);

    return { data, total, page, limit };
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

  async findPair(
    studentId: string,
    parentId: string,
  ): Promise<StudentParent | null> {
    return this.prisma.studentParent.findUnique({
      where: { studentId_parentId: { studentId, parentId } },
    });
  }

  async findStudent(id: string): Promise<StudentReference | null> {
    return this.prisma.student.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });
  }

  async findParent(id: string): Promise<ParentReference | null> {
    return this.prisma.parent.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });
  }

  async create(dto: CreateStudentParentDto): Promise<StudentParentWithDetails> {
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
    studentId: string,
    dto: UpdateStudentParentDto,
  ): Promise<StudentParentWithDetails> {
    return this.prisma.$transaction(async (tx) => {
      if (dto.isPrimary) {
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

  async remove(id: string): Promise<StudentParent> {
    return this.prisma.studentParent.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
