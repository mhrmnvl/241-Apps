import { Injectable } from '@nestjs/common';
import { EnrollmentStatus, Prisma, StudentEnrollment } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import type {
  StudentEnrollmentQueryInput,
  UpdateEnrollmentRepositoryInput,
} from '../../domain/interfaces/enrollment-repository.interface.js';
import { resolveSemesterId } from '../../../../shared/utils/active-academic-year.helper.js';
import { IEnrollmentRepository } from '../../domain/interfaces/enrollment-repository.interface.js';
import {
  ENROLLMENT_WITH_DETAILS_INCLUDE,
  EnrollmentWithDetails,
} from './prisma-enrollment.includes.js';
import {
  buildEnrollmentListWhere,
  countActiveByClassroomSemester,
  countActiveByIds,
  findActiveByClassroomSemester,
  findActiveByStudent,
  findActiveEnrollment,
  findDuplicateEnrollment,
  findManyActiveByIds,
  findSoftDeletedEnrollment,
} from './prisma-enrollment.queries.js';
import {
  BulkEnrollmentRow,
  createManyEnrollments,
  createManyForRollover,
  updateManyStatus,
} from './prisma-enrollment.bulk.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

/**
 * Prisma adapter for `IEnrollmentRepository`.
 *
 * The "is the student actively enrolled?" read family lives in `.queries` and
 * the set-based writes in `.bulk`; single-row CRUD stays here.
 */
@Injectable()
export class PrismaEnrollmentRepository extends IEnrollmentRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(
    query: StudentEnrollmentQueryInput,
  ): Promise<PaginatedResult<EnrollmentWithDetails>> {
    const { page = 1, limit = 10, semesterId, academicYearId } = query;

    // Neither scope given: fall back to the active semester so the list is not
    // an unbounded read across every year.
    const resolvedSemesterId =
      semesterId ??
      (academicYearId ? undefined : await resolveSemesterId(this.prisma));

    const where = buildEnrollmentListWhere(query, resolvedSemesterId);

    const [data, total] = await Promise.all([
      this.prisma.studentEnrollment.findMany({
        where,
        include: ENROLLMENT_WITH_DETAILS_INCLUDE,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { enrolledAt: 'desc' },
      }),
      this.prisma.studentEnrollment.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<EnrollmentWithDetails | null> {
    return this.prisma.studentEnrollment.findFirst({
      where: { id, deletedAt: null },
      include: ENROLLMENT_WITH_DETAILS_INCLUDE,
    });
  }

  // ── active-enrolment reads ───────────────────────────────────────────

  async findActiveByStudentId(studentId: string) {
    return findActiveByStudent(this.prisma, studentId);
  }

  async findActiveByClassroomAndSemester(
    classroomId: string,
    semesterId: string,
  ) {
    return findActiveByClassroomSemester(this.prisma, classroomId, semesterId);
  }

  async countActiveByClassroomAndSemester(
    classroomId: string,
    semesterId: string,
  ) {
    return countActiveByClassroomSemester(this.prisma, classroomId, semesterId);
  }

  async countActiveByIds(ids: string[]) {
    return countActiveByIds(this.prisma, ids);
  }

  async findManyActiveByIds(ids: string[]) {
    return findManyActiveByIds(this.prisma, ids);
  }

  async findActiveEnrollment(
    studentId: string,
    semesterId?: string,
    excludeId?: string,
  ) {
    return findActiveEnrollment(this.prisma, studentId, semesterId, excludeId);
  }

  async findDuplicate(
    studentId: string,
    semesterId?: string,
    excludeId?: string,
  ) {
    return findDuplicateEnrollment(
      this.prisma,
      studentId,
      semesterId,
      excludeId,
    );
  }

  async findSoftDeleted(studentId: string, semesterId: string) {
    return findSoftDeletedEnrollment(this.prisma, studentId, semesterId);
  }

  // ── single-row writes ────────────────────────────────────────────────

  async create(data: BulkEnrollmentRow): Promise<EnrollmentWithDetails> {
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

  async remove(id: string): Promise<StudentEnrollment> {
    return this.softDelete(id);
  }

  // ── set-based writes ─────────────────────────────────────────────────

  async createMany(rows: BulkEnrollmentRow[]): Promise<Prisma.BatchPayload> {
    return createManyEnrollments(this.prisma, rows);
  }

  async bulkCreateForRollover(
    rows: Omit<BulkEnrollmentRow, 'status'>[],
  ): Promise<Prisma.BatchPayload> {
    return createManyForRollover(this.prisma, rows);
  }

  async bulkUpdateStatus(
    ids: string[],
    status: EnrollmentStatus,
    endedAt?: Date,
  ): Promise<Prisma.BatchPayload> {
    return updateManyStatus(this.prisma, ids, status, endedAt);
  }
}
