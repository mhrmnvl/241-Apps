import { Injectable } from '@nestjs/common';
import { Prisma, Teacher, User, Profile } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { AccountProvisioningService } from '../../../../platform/user/index.js';
import type {
  ProfileEntity,
  ProfileUpdateInput,
} from '../../../../platform/profile/domain/entities/profile.entity.js';
import { resolveAcademicYearId } from '../../../../shared/utils/active-academic-year.helper.js';
import { ITeacherRepository } from '../../domain/interfaces/teacher-repository.interface.js';
import {
  TEACHER_LIST_INCLUDE,
  TEACHER_DETAIL_INCLUDE,
  TeacherWithDetails,
  TeacherListWithDetails,
} from './prisma-teacher.includes.js';
import type {
  TeacherQueryInput,
  ExportTeacherQueryInput,
  CreateTeacherRepositoryInput,
  UpdateTeacherRepositoryInput,
} from '../../domain/interfaces/teacher-repository.interface.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

@Injectable()
export class PrismaTeacherRepository extends ITeacherRepository {
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
    query: TeacherQueryInput,
  ): Promise<PaginatedResult<TeacherListWithDetails>> {
    const {
      page = 1,
      limit = 10,
      search,
      employmentTypeId,
      academicYearId,
      positionCategoryId,
      isActive,
    } = query;
    const skip = (page - 1) * limit;

    const resolvedAcademicYearId = academicYearId
      ? await resolveAcademicYearId(this.prisma, academicYearId)
      : undefined;

    const where: Prisma.TeacherWhereInput = {
      deletedAt: null,
      user: {
        ...(isActive !== undefined && { isActive }),
      },
      ...(employmentTypeId && { employmentTypeId }),
      ...(positionCategoryId && {
        teacherPositions: {
          some: {
            isPrimary: true,
            deletedAt: null,
            position: { categoryId: positionCategoryId },
          },
        },
      }),
      ...(resolvedAcademicYearId && {
        OR: [
          {
            classroomSupervisors: {
              some: { semester: { academicYearId: resolvedAcademicYearId } },
            },
          },
          {
            teachingAssignments: {
              some: { semester: { academicYearId: resolvedAcademicYearId } },
            },
          },
        ],
      }),
      ...(search && {
        OR: [
          { nip: { contains: search, mode: 'insensitive' } },
          { nuptk: { contains: search, mode: 'insensitive' } },
          {
            user: {
              profile: { name: { contains: search, mode: 'insensitive' } },
            },
          },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.teacher.findMany({
        where,
        include: TEACHER_LIST_INCLUDE,
        skip,
        take: limit,
        orderBy: { user: { profile: { name: 'asc' } } },
      }),
      this.prisma.teacher.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findAllForExport(
    filters: ExportTeacherQueryInput,
  ): Promise<TeacherListWithDetails[]> {
    const { search, employmentTypeId, isActive } = filters;

    const where: Prisma.TeacherWhereInput = {
      deletedAt: null,
      user: {
        ...(isActive !== undefined && { isActive }),
      },
      ...(employmentTypeId && { employmentTypeId }),
      ...(search && {
        OR: [
          { nip: { contains: search, mode: 'insensitive' } },
          { nuptk: { contains: search, mode: 'insensitive' } },
          {
            user: {
              profile: { name: { contains: search, mode: 'insensitive' } },
            },
          },
        ],
      }),
    };

    return this.prisma.teacher.findMany({
      where,
      include: TEACHER_LIST_INCLUDE,
      orderBy: { user: { profile: { name: 'asc' } } },
    });
  }

  async findById(id: string): Promise<TeacherWithDetails | null> {
    return this.prisma.teacher.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: TEACHER_DETAIL_INCLUDE,
    });
  }

  async findUserByIdentifier(identifier: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { identifier, deletedAt: null },
    });
  }

  async findProfileByNik(nik: string): Promise<Profile | null> {
    return this.prisma.profile.findUnique({ where: { nik } });
  }

  async findByUserId(userId: string): Promise<Teacher | null> {
    return this.prisma.teacher.findUnique({ where: { userId } });
  }

  async findByNip(nip: string, excludeId?: string): Promise<Teacher | null> {
    return this.prisma.teacher.findFirst({
      where: { nip, ...(excludeId && { NOT: { id: excludeId } }) },
    });
  }

  async findByNuptk(
    nuptk: string,
    excludeId?: string,
  ): Promise<Teacher | null> {
    return this.prisma.teacher.findFirst({
      where: { nuptk, ...(excludeId && { NOT: { id: excludeId } }) },
    });
  }

  async findProfileByUserId(
    userId: string,
    nik: string,
  ): Promise<Profile | null> {
    return this.prisma.profile.findFirst({ where: { nik, NOT: { userId } } });
  }

  async updateProfile(
    userId: string,
    data: ProfileUpdateInput,
  ): Promise<ProfileEntity> {
    return this.prisma.profile.update({ where: { userId }, data });
  }

  async create(
    dto: CreateTeacherRepositoryInput,
    hashedPassword: string,
  ): Promise<TeacherWithDetails> {
    return this.prisma.$transaction(async (tx) => {
      const user = await this.accountProvisioning.provision(tx, {
        identifier: dto.identifier ?? dto.nip ?? dto.nuptk ?? dto.nik,
        passwordHash: hashedPassword,
        roleCode: 'TEACHER',
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

      return tx.teacher.create({
        data: {
          userId: user.id,
          nip: dto.nip,
          nuptk: dto.nuptk,
          employmentTypeId: dto.employmentTypeId,
          ...(dto.positionId
            ? {
                teacherPositions: {
                  create: {
                    positionId: dto.positionId,
                    hireDate: new Date(),
                    isPrimary: true,
                  },
                },
              }
            : {}),
        },
        include: TEACHER_DETAIL_INCLUDE,
      });
    });
  }

  async update(
    id: string,
    dto: UpdateTeacherRepositoryInput,
  ): Promise<TeacherWithDetails> {
    return this.prisma.teacher.update({
      where: { id },
      data: {
        nip: dto.nip,
        nuptk: dto.nuptk,
        employmentTypeId: dto.employmentTypeId,
      },
      include: TEACHER_DETAIL_INCLUDE,
    });
  }

  async resolveEmploymentTypeId(code: string): Promise<string> {
    let empType = await this.prisma.employmentType.findFirst({
      where: { code },
    });
    empType ??= await this.prisma.employmentType.create({
      data: {
        code,
        name: code,
      },
    });
    return empType.id;
  }

  async softDelete(id: string, userId: string): Promise<[Teacher, User]> {
    return this.prisma.$transaction([
      this.prisma.teacher.update({
        where: { id },
        data: { deletedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { deletedAt: new Date(), isActive: false },
      }),
    ]);
  }

  async getActiveEmploymentTypeCodes(): Promise<string[]> {
    const empTypes = await this.prisma.employmentType.findMany({
      where: { deletedAt: null },
      select: { code: true },
    });
    return empTypes.map((et) => et.code);
  }
}
