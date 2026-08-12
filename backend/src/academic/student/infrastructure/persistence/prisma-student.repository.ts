import { Injectable } from '@nestjs/common';
import { Student, User, Profile, StudentStatus } from '@prisma/client';
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
  STUDENT_EXPORT_INCLUDE,
  STUDENT_LIST_INCLUDE,
  StudentExportWithDetails,
  StudentWithDetails,
} from './prisma-student.includes.js';
import {
  buildStudentListWhere,
  buildStudentExportWhere,
} from './prisma-student.where.js';
import {
  createStudentInTx,
  createStudentWithRelationsInTx,
  softDeleteStudentInTx,
  updateStudentProfile,
} from './prisma-student.writer.js';
import {
  findActiveGradeLevels,
  findActiveClassroomCodes,
} from './prisma-student.lookups.js';
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
    const { page = 1, limit = 10 } = query;
    const where = buildStudentListWhere(query);

    const [data, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        include: STUDENT_LIST_INCLUDE,
        skip: (page - 1) * limit,
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
  ): Promise<StudentExportWithDetails[]> {
    return this.prisma.student.findMany({
      where: buildStudentExportWhere(filters),
      include: STUDENT_EXPORT_INCLUDE,
      orderBy: { user: { profile: { name: 'asc' } } },
    });
  }

  async findById(id: string): Promise<StudentWithDetails | null> {
    return this.prisma.student.findFirst({
      where: { id, deletedAt: null },
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
      where: { nis, deletedAt: null },
    });
  }

  async findByNisn(nisn: string): Promise<Student | null> {
    return this.prisma.student.findFirst({
      where: { nisn, deletedAt: null },
    });
  }

  async isStudent(userId: string): Promise<boolean> {
    const role = await this.prisma.userRole.findFirst({
      where: { userId, role: { code: 'STUDENT' } },
    });
    return !!role;
  }

  async create(
    dto: CreateStudentRepositoryInput,
    passwordHash: string,
  ): Promise<CreateStudentResult> {
    return this.prisma.$transaction((tx) =>
      createStudentInTx(tx, this.accountProvisioning, dto, passwordHash),
    );
  }

  async createWithRelations(
    dto: CreateStudentWithRelationsRepositoryInput,
    passwordHash: string,
  ): Promise<StudentWithDetails> {
    return this.prisma.$transaction((tx) =>
      createStudentWithRelationsInTx(
        tx,
        this.accountProvisioning,
        dto,
        passwordHash,
      ),
    );
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
    await this.prisma.$transaction((tx) => softDeleteStudentInTx(tx, id));
  }

  async updateProfile(
    id: string,
    data: ProfileUpdateInput,
  ): Promise<Profile | null> {
    return updateStudentProfile(this.prisma, id, data);
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
    return findActiveGradeLevels(this.prisma);
  }

  async getActiveClassroomCodes(): Promise<string[]> {
    return findActiveClassroomCodes(this.prisma);
  }
}
