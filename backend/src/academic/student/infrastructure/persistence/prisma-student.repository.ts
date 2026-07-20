import { Injectable } from '@nestjs/common';
import { Prisma, Student, User, Profile, StudentStatus } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { AccountProvisioningService } from '../../../../platform/user/index.js';
import { CreateStudentDto } from '../../dto/request/create-student.dto.js';
import { ExportStudentQueryDto } from '../../dto/request/export-student-query.dto.js';
import { StudentQueryDto } from '../../dto/request/student-query.dto.js';
import { UpdateStudentDto } from '../../dto/request/update-student.dto.js';
import {
  IStudentRepository,
  STUDENT_INCLUDE,
  StudentWithDetails,
  CreateStudentResult,
} from '../../domain/interfaces/student-repository.interface.js';
import { UpdateProfileDto } from '../../../../platform/profile/index.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

@Injectable()
export class PrismaStudentRepository extends IStudentRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accountProvisioning: AccountProvisioningService,
  ) {
    super();
  }

  async toggleUserActive(userId: string, isActive: boolean): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });
  }

  async findAll(
    query: StudentQueryDto,
  ): Promise<PaginatedResult<StudentWithDetails>> {
    const {
      page = 1,
      limit = 10,
      search,
      semesterId,
      classroomId,
      status,
      isActive,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.StudentWhereInput = {
      deletedAt: null,
      ...(isActive !== undefined && {
        user: { isActive },
      }),
      ...(status && { status }),
      ...(semesterId && {
        enrollments: {
          some: {
            semesterId,
            deletedAt: null,
            ...(classroomId && { classroomId }),
          },
        },
      }),
      ...(!semesterId &&
        classroomId && {
          enrollments: { some: { classroomId, deletedAt: null } },
        }),
      ...(search && {
        OR: [
          { nis: { contains: search, mode: 'insensitive' } },
          { nisn: { contains: search, mode: 'insensitive' } },
          {
            user: {
              profile: { name: { contains: search, mode: 'insensitive' } },
            },
          },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        include: STUDENT_INCLUDE,
        skip,
        take: limit,
        orderBy: { user: { profile: { name: 'asc' } } },
      }),
      this.prisma.student.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findAllForExport(
    filters: ExportStudentQueryDto,
  ): Promise<StudentWithDetails[]> {
    const { search, classroomId, isActive } = filters;

    const where: Prisma.StudentWhereInput = {
      deletedAt: null,
      ...(isActive !== undefined && {
        user: { isActive },
      }),
      ...(classroomId && {
        enrollments: { some: { classroomId, deletedAt: null } },
      }),
      ...(search && {
        OR: [
          { nis: { contains: search, mode: 'insensitive' } },
          { nisn: { contains: search, mode: 'insensitive' } },
          {
            user: {
              profile: { name: { contains: search, mode: 'insensitive' } },
            },
          },
        ],
      }),
    };

    return this.prisma.student.findMany({
      where,
      include: STUDENT_INCLUDE,
      orderBy: { user: { profile: { name: 'asc' } } },
    });
  }

  async findById(id: string): Promise<StudentWithDetails | null> {
    return this.prisma.student.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: STUDENT_INCLUDE,
    });
  }

  async findByUserId(userId: string): Promise<{ id: string } | null> {
    return this.prisma.student.findFirst({
      where: { userId, deletedAt: null },
      select: { id: true },
    });
  }

  async findByNis(nis: string): Promise<Student | null> {
    return this.prisma.student.findFirst({
      where: {
        nis,
        deletedAt: null,
      },
    });
  }

  async findByNisn(nisn: string): Promise<Student | null> {
    return this.prisma.student.findFirst({
      where: {
        nisn,
        deletedAt: null,
      },
    });
  }

  async isStudent(userId: string): Promise<boolean> {
    const role = await this.prisma.userRole.findFirst({
      where: {
        userId,
        role: { code: 'STUDENT' },
      },
    });
    return !!role;
  }

  async create(
    dto: CreateStudentDto,
    passwordHash: string,
  ): Promise<CreateStudentResult> {
    return this.prisma.$transaction(async (tx) => {
      const user = await this.accountProvisioning.provision(tx, {
        identifier: dto.identifier!,
        passwordHash,
        roleCode: 'STUDENT',
        profile: {
          name: dto.name,
          nik: dto.nik,
          gender: dto.gender,
          birthPlace: dto.birthPlace,
          birthDate: new Date(dto.birthDate),
          email: dto.email,
          phone: dto.phone,
        },
      });

      const student = await tx.student.create({
        data: {
          userId: user.id,
          nis: dto.nis,
          nisn: dto.nisn,
          status: StudentStatus.ACTIVE,
          ...(dto.gradeId && {
            gradeId: dto.gradeId,
          }),
        },
        include: STUDENT_INCLUDE,
      });

      return { ...user, student };
    });
  }

  async update(id: string, dto: UpdateStudentDto): Promise<StudentWithDetails> {
    return this.prisma.student.update({
      where: { id },
      data: dto,
      include: STUDENT_INCLUDE,
    });
  }

  async updateStatus(
    id: string,
    status: StudentStatus,
  ): Promise<StudentWithDetails> {
    return this.prisma.student.update({
      where: { id },
      data: { status },
      include: STUDENT_INCLUDE,
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const student = await tx.student.update({
        where: { id },
        data: { deletedAt: new Date() },
        include: { user: true },
      });

      await tx.user.update({
        where: { id: student.userId },
        data: { isActive: false, deletedAt: new Date() },
      });
    });
  }

  async updateProfile(
    id: string,
    dto: UpdateProfileDto,
  ): Promise<Profile | null> {
    const student = await this.prisma.student.findFirst({
      where: { id, deletedAt: null },
      select: { userId: true },
    });
    if (!student) return null;
    return this.prisma.profile.update({
      where: { userId: student.userId },
      data: {
        ...dto,
        ...(dto.birthDate && { birthDate: new Date(dto.birthDate) }),
      },
    });
  }

  async softDelete(id: string, userId: string): Promise<[Student, User]> {
    return this.prisma.$transaction([
      this.prisma.student.update({
        where: { id },
        data: { deletedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { deletedAt: new Date(), isActive: false },
      }),
    ]);
  }
}
