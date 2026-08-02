import { Injectable } from '@nestjs/common';
import { EnrollmentStatus, Prisma, StudentEnrollment } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import type {
  StudentEnrollmentQueryInput,
  CreateEnrollmentRepositoryInput,
  UpdateEnrollmentRepositoryInput,
} from '../../domain/interfaces/enrollment-repository.interface.js';
import { resolveSemesterId } from '../../../../shared/utils/active-academic-year.helper.js';
import { IEnrollmentRepository } from '../../domain/interfaces/enrollment-repository.interface.js';
import {
  ENROLLMENT_WITH_DETAILS_INCLUDE,
  EnrollmentWithDetails,
} from './prisma-enrollment.includes.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

@Injectable()
export class PrismaEnrollmentRepository extends IEnrollmentRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(
    query: StudentEnrollmentQueryInput,
  ): Promise<PaginatedResult<EnrollmentWithDetails>> {
    const {
      page = 1,
      limit = 10,
      studentId,
      classroomId,
      semesterId,
      academicYearId,
      status,
    } = query;
    const skip = (page - 1) * limit;

    let resolvedSemesterId = semesterId;
    const resolvedAcademicYearId = academicYearId;

    if (!resolvedSemesterId && !resolvedAcademicYearId) {
      resolvedSemesterId = await resolveSemesterId(this.prisma);
    }

    const where: Prisma.StudentEnrollmentWhereInput = {
      deletedAt: null,
      ...(studentId && { studentId }),
      ...(classroomId && { classroomId }),
      ...(resolvedSemesterId && { semesterId: resolvedSemesterId }),
      ...(status && { status: status }),
      ...(resolvedAcademicYearId && {
        semester: { academicYearId: resolvedAcademicYearId },
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.studentEnrollment.findMany({
        where,
        include: ENROLLMENT_WITH_DETAILS_INCLUDE,
        skip,
        take: limit,
        orderBy: { enrolledAt: 'desc' },
      }),
      this.prisma.studentEnrollment.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<EnrollmentWithDetails | null> {
    return this.prisma.studentEnrollment.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: ENROLLMENT_WITH_DETAILS_INCLUDE,
    });
  }

  async findActiveByStudentId(
    studentId: string,
  ): Promise<EnrollmentWithDetails | null> {
    return this.prisma.studentEnrollment.findFirst({
      where: {
        studentId,
        status: EnrollmentStatus.ACTIVE,
        deletedAt: null,
      },
      include: ENROLLMENT_WITH_DETAILS_INCLUDE,
    });
  }

  async findActiveByClassroomAndSemester(
    classroomId: string,
    semesterId: string,
  ): Promise<EnrollmentWithDetails[]> {
    return this.prisma.studentEnrollment.findMany({
      where: {
        classroomId,
        semesterId,
        status: EnrollmentStatus.ACTIVE,
        deletedAt: null,
      },
      include: ENROLLMENT_WITH_DETAILS_INCLUDE,
    });
  }

  async countActiveByClassroomAndSemester(
    classroomId: string,
    semesterId: string,
  ): Promise<number> {
    return this.prisma.studentEnrollment.count({
      where: {
        classroomId,
        semesterId,
        status: EnrollmentStatus.ACTIVE,
        deletedAt: null,
      },
    });
  }

  async countActiveByIds(ids: string[]): Promise<number> {
    return this.prisma.studentEnrollment.count({
      where: {
        id: { in: ids },
        status: EnrollmentStatus.ACTIVE,
        deletedAt: null,
      },
    });
  }

  async findManyActiveByIds(ids: string[]): Promise<EnrollmentWithDetails[]> {
    return this.prisma.studentEnrollment.findMany({
      where: {
        id: { in: ids },
        status: EnrollmentStatus.ACTIVE,
        deletedAt: null,
      },
      include: ENROLLMENT_WITH_DETAILS_INCLUDE,
    });
  }

  async findActiveEnrollment(
    studentId: string,
    semesterId?: string,
    excludeId?: string,
  ): Promise<EnrollmentWithDetails | null> {
    return this.prisma.studentEnrollment.findFirst({
      where: {
        studentId,
        ...(semesterId && { semesterId }),
        status: EnrollmentStatus.ACTIVE,
        deletedAt: null,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
      include: ENROLLMENT_WITH_DETAILS_INCLUDE,
    });
  }

  async remove(id: string): Promise<StudentEnrollment> {
    return this.softDelete(id);
  }

  async findDuplicate(
    studentId: string,
    semesterId?: string,
    excludeId?: string,
  ): Promise<StudentEnrollment | null> {
    return this.prisma.studentEnrollment.findFirst({
      where: {
        studentId,
        ...(semesterId && { semesterId }),
        deletedAt: null,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
  }

  async create(data: {
    studentId: string;
    classroomId: string;
    semesterId: string;
    status?: EnrollmentStatus;
  }): Promise<EnrollmentWithDetails> {
    return this.prisma.studentEnrollment.create({
      data: {
        studentId: data.studentId,
        classroomId: data.classroomId,
        semesterId: data.semesterId,
        status: data.status ?? undefined,
      },
      include: ENROLLMENT_WITH_DETAILS_INCLUDE,
    });
  }

  async update(
    id: string,
    data: UpdateEnrollmentRepositoryInput,
  ): Promise<EnrollmentWithDetails> {
    return this.prisma.studentEnrollment.update({
      where: { id },
      data,
      include: ENROLLMENT_WITH_DETAILS_INCLUDE,
    });
  }

  async createMany(
    data: {
      studentId: string;
      classroomId: string;
      semesterId: string;
      status?: EnrollmentStatus;
    }[],
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.studentEnrollment.createMany({
      data: data.map((item) => ({
        ...item,
        status: item.status ?? undefined,
      })),
      skipDuplicates: true,
    });
  }

  async bulkCreateForRollover(
    data: {
      studentId: string;
      classroomId: string;
      semesterId: string;
    }[],
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.studentEnrollment.createMany({
      data: data.map((item) => ({
        ...item,
        status: EnrollmentStatus.ACTIVE,
      })),
      skipDuplicates: true,
    });
  }

  async bulkUpdateStatus(
    ids: string[],
    status: EnrollmentStatus,
    endedAt?: Date,
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.studentEnrollment.updateMany({
      where: {
        id: { in: ids },
      },
      data: { status, ...(endedAt && { endedAt }) },
    });
  }

  async findSoftDeleted(
    studentId: string,
    semesterId: string,
  ): Promise<StudentEnrollment | null> {
    return this.prisma.studentEnrollment.findFirst({
      where: {
        studentId,
        semesterId,
        deletedAt: { not: null },
      },
    });
  }

  async restore(
    id: string,
    data: { classroomId: string },
  ): Promise<EnrollmentWithDetails> {
    return this.prisma.studentEnrollment.update({
      where: { id },
      data: { ...data, deletedAt: null, status: EnrollmentStatus.ACTIVE },
      include: ENROLLMENT_WITH_DETAILS_INCLUDE,
    });
  }
  async softDelete(id: string): Promise<StudentEnrollment> {
    return this.prisma.studentEnrollment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
