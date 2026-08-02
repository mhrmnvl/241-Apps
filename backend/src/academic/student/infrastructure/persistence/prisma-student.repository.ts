import { Injectable } from '@nestjs/common';
import { Prisma, Student, User, Profile, StudentStatus } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { AccountProvisioningService } from '../../../../platform/user/index.js';
import type {
  StudentQueryInput,
  ExportStudentQueryInput,
  CreateStudentRepositoryInput,
  UpdateStudentRepositoryInput,
  CreateStudentWithRelationsRepositoryInput,
} from '../../domain/interfaces/student-repository.interface.js';
import {
  IStudentRepository,
  CreateStudentResult,
} from '../../domain/interfaces/student-repository.interface.js';
import {
  STUDENT_DETAIL_INCLUDE,
  STUDENT_LIST_INCLUDE,
  StudentWithDetails,
} from './prisma-student.includes.js';
import type { ProfileUpdateInput } from '../../../../platform/profile/domain/entities/profile.entity.js';
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
    query: StudentQueryInput,
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
        include: STUDENT_LIST_INCLUDE,
        skip,
        take: limit,
        orderBy: [
          { grade: { level: 'asc' } },
          { user: { profile: { name: 'asc' } } },
        ],
      }),
      this.prisma.student.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findAllForExport(
    filters: ExportStudentQueryInput,
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
      include: STUDENT_LIST_INCLUDE,
      orderBy: { user: { profile: { name: 'asc' } } },
    });
  }

  async findById(id: string): Promise<StudentWithDetails | null> {
    return this.prisma.student.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: STUDENT_DETAIL_INCLUDE,
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
    dto: CreateStudentRepositoryInput,
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
          nis: dto.nis ?? '',
          nisn: dto.nisn ?? '',
          status: StudentStatus.ACTIVE,
          ...(dto.gradeId && {
            gradeId: dto.gradeId,
          }),
        },
        include: {
          user: {
            select: {
              id: true,
              identifier: true,
              isActive: true,
              createdAt: true,
              updatedAt: true,
              profile: true,
            },
          },
          grade: true,
          enrollments: {
            where: { deletedAt: null },
            include: {
              classroom: true,
              semester: { include: { academicYear: true } },
            },
            orderBy: { enrolledAt: 'desc' as const },
          },
        },
      });

      return {
        ...user,
        student,
      };
    });
  }

  async update(
    id: string,
    dto: UpdateStudentRepositoryInput,
  ): Promise<StudentWithDetails> {
    return this.prisma.student.update({
      where: { id },
      data: dto,
      include: STUDENT_DETAIL_INCLUDE,
    });
  }

  async updateStatus(
    id: string,
    status: StudentStatus,
  ): Promise<StudentWithDetails> {
    return this.prisma.student.update({
      where: { id },
      data: { status },
      include: STUDENT_DETAIL_INCLUDE,
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
    data: ProfileUpdateInput,
  ): Promise<Profile | null> {
    const student = await this.prisma.student.findFirst({
      where: { id, deletedAt: null },
      select: { userId: true },
    });
    if (!student) return null;
    return this.prisma.profile.update({
      where: { userId: student.userId },
      data,
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

  async getActiveGradeLevels(): Promise<number[]> {
    const grades = await this.prisma.grade.findMany({
      where: { deletedAt: null, isActive: true },
      select: { level: true },
      orderBy: { level: 'asc' },
    });
    return grades.map((g) => g.level);
  }

  async getActiveClassroomCodes(): Promise<string[]> {
    const classrooms = await this.prisma.classroom.findMany({
      where: { deletedAt: null, isActive: true },
      select: { code: true },
      orderBy: { code: 'asc' },
    });
    return classrooms.map((c) => c.code);
  }

  async createWithRelations(
    dto: CreateStudentWithRelationsRepositoryInput,
    passwordHash: string,
  ): Promise<StudentWithDetails> {
    return this.prisma.$transaction(async (tx) => {
      // 1. Create user + student
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
          nis: dto.nis ?? '',
          nisn: dto.nisn ?? '',
          status: StudentStatus.ACTIVE,
          ...(dto.gradeId && { gradeId: dto.gradeId }),
        },
      });

      // 2. Create address (optional)
      if (dto.address) {
        await tx.address.create({
          data: {
            studentId: student.id,
            street: dto.address.street,
            rt: dto.address.rt,
            rw: dto.address.rw,
            village: dto.address.village,
            district: dto.address.district,
            city: dto.address.city,
            province: dto.address.province,
            country: dto.address.country ?? 'Indonesia',
            postalCode: dto.address.postalCode,
            isPrimary: dto.address.isPrimary ?? true,
          },
        });
      }

      // 3. Create parents + links (optional)
      for (const parentInput of dto.parents ?? []) {
        const parent = await tx.parent.create({
          data: {
            name: parentInput.name,
            nik: parentInput.nik,
            birthPlace: parentInput.birthPlace,
            birthDate: new Date(parentInput.birthDate),
            email: parentInput.email,
            phone: parentInput.phone,
            occupationId: parentInput.occupationId,
            income: parentInput.income,
          },
        });
        await tx.studentParent.create({
          data: {
            studentId: student.id,
            parentId: parent.id,
            relation: parentInput.relation,
            isPrimary: parentInput.isPrimary ?? false,
          },
        });
      }

      // 4. Return full student with details
      return tx.student.findUniqueOrThrow({
        where: { id: student.id },
        include: STUDENT_DETAIL_INCLUDE,
      });
    });
  }
}
