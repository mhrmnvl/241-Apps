import { Injectable, NotFoundException } from '@nestjs/common';
import {
  EnrollmentStatus,
  Prisma,
  StudentGraduation,
  StudentStatus,
} from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import type {
  StudentGraduationQueryInput,
  CreateStudentGraduationRepositoryInput,
  UpdateStudentGraduationRepositoryInput,
} from '../../domain/interfaces/graduation-repository.interface.js';
import { IGraduationRepository } from '../../domain/interfaces/graduation-repository.interface.js';
import type {
  BulkGraduationInput,
  BulkGraduationResult,
  GraduationCandidate,
} from '../../domain/interfaces/graduation-repository.interface.js';
import { graduateStudentSteps } from './prisma-graduation.steps.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';
import {
  GRADUATION_WITH_DETAILS_INCLUDE,
  GraduationWithDetails,
} from './prisma-graduation.includes.js';

@Injectable()
export class PrismaGraduationRepository extends IGraduationRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(
    query: StudentGraduationQueryInput,
  ): Promise<PaginatedResult<GraduationWithDetails>> {
    const { page = 1, limit = 10, academicYearId, search } = query;
    const skip = (page - 1) * limit;

    // No active-year fallback on purpose, unlike classroom and curriculum: the
    // alumni list accumulates across years, and the UI offers an explicit
    // "Semua Tahun Ajaran" option that a default would quietly override.
    const where: Prisma.StudentGraduationWhereInput = {
      deletedAt: null,
      ...(academicYearId && { academicYearId }),
      ...(search && {
        student: {
          OR: [
            { nis: { contains: search, mode: 'insensitive' } },
            { nisn: { contains: search, mode: 'insensitive' } },
            {
              user: {
                profile: {
                  name: { contains: search, mode: 'insensitive' },
                },
              },
            },
          ],
        },
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.studentGraduation.findMany({
        where,
        include: GRADUATION_WITH_DETAILS_INCLUDE,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.studentGraduation.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<GraduationWithDetails | null> {
    return this.prisma.studentGraduation.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: GRADUATION_WITH_DETAILS_INCLUDE,
    });
  }

  async findByStudentId(studentId: string): Promise<StudentGraduation | null> {
    return this.prisma.studentGraduation.findFirst({
      where: {
        studentId,
        deletedAt: null,
      },
    });
  }

  async create(
    dto: CreateStudentGraduationRepositoryInput,
  ): Promise<GraduationWithDetails> {
    return this.prisma.$transaction(async (tx) => {
      const student = await tx.student.findFirst({
        where: {
          id: dto.studentId,
        },
      });

      if (!student) {
        throw new NotFoundException(`Student ${dto.studentId} not found`);
      }

      const id = await graduateStudentSteps(tx, {
        studentId: dto.studentId,
        academicYearId: dto.academicYearId,
        ...(dto.graduationDate && {
          graduationDate: new Date(dto.graduationDate),
        }),
        ...(dto.certificateNo && { certificateNo: dto.certificateNo }),
        ...(dto.note && { note: dto.note }),
      });

      return tx.studentGraduation.findUniqueOrThrow({
        where: { id },
        include: GRADUATION_WITH_DETAILS_INCLUDE,
      });
    });
  }

  async update(
    id: string,
    dto: UpdateStudentGraduationRepositoryInput,
  ): Promise<GraduationWithDetails> {
    const { studentId, academicYearId, graduationDate, ...rest } = dto;
    return this.prisma.studentGraduation.update({
      where: { id },
      data: {
        ...rest,
        ...(studentId && { studentId }),
        ...(academicYearId && { academicYearId }),
        ...(graduationDate && { graduationDate: new Date(graduationDate) }),
      },
      include: GRADUATION_WITH_DETAILS_INCLUDE,
    });
  }

  async remove(id: string): Promise<StudentGraduation> {
    return this.softDelete(id);
  }

  /**
   * Students eligible to graduate from the given semester.
   *
   * "Final grade" is the highest level among the classrooms of that semester's
   * academic year — the same rule the promotion recommendation uses to decide
   * who it must leave out, so the two cannot disagree about who is in the last
   * year. Anyone already holding a graduation record is filtered out here so
   * the screen never offers a student it would then skip.
   */
  async findCandidates(semesterId: string): Promise<GraduationCandidate[]> {
    const semester = await this.prisma.semester.findFirst({
      where: { id: semesterId, deletedAt: null },
      select: { academicYearId: true },
    });
    if (!semester) return [];

    const levels = await this.prisma.classroom.findMany({
      where: { academicYearId: semester.academicYearId, deletedAt: null },
      select: { grade: { select: { level: true } } },
    });
    if (levels.length === 0) return [];
    const finalLevel = Math.max(...levels.map((c) => c.grade.level));

    const enrollments = await this.prisma.studentEnrollment.findMany({
      where: {
        semesterId,
        status: EnrollmentStatus.ACTIVE,
        deletedAt: null,
        student: {
          status: StudentStatus.ACTIVE,
          deletedAt: null,
          // A soft-deleted graduation does not count: a record that was
          // withdrawn must let the student appear as a candidate again.
          graduations: { none: { deletedAt: null } },
        },
        classroom: { grade: { level: finalLevel }, deletedAt: null },
      },
      select: {
        studentId: true,
        classroom: {
          select: { id: true, code: true, grade: { select: { name: true } } },
        },
        student: {
          select: {
            nis: true,
            user: { select: { profile: { select: { name: true } } } },
          },
        },
      },
      orderBy: { student: { nis: 'asc' } },
    });

    return enrollments.map((e) => ({
      studentId: e.studentId,
      studentName: e.student.user?.profile?.name ?? '-',
      nis: e.student.nis,
      classroomId: e.classroom.id,
      classroomName: e.classroom.code,
      gradeName: e.classroom.grade.name,
    }));
  }

  /**
   * One transaction for the whole cohort: a run that half-graduated a year
   * would leave the school unable to tell which half.
   */
  async executeBulk(input: BulkGraduationInput): Promise<BulkGraduationResult> {
    return this.prisma.$transaction(async (tx) => {
      const result: BulkGraduationResult = { graduated: 0, skipped: 0 };

      for (const student of input.students) {
        const existing = await tx.studentGraduation.findFirst({
          where: { studentId: student.studentId, deletedAt: null },
          select: { id: true },
        });
        if (existing) {
          result.skipped++;
          continue;
        }

        await graduateStudentSteps(tx, {
          studentId: student.studentId,
          academicYearId: input.academicYearId,
          ...(input.graduationDate && {
            graduationDate: input.graduationDate,
          }),
          ...(student.certificateNo && {
            certificateNo: student.certificateNo,
          }),
          ...(student.note && { note: student.note }),
        });
        result.graduated++;
      }

      return result;
    });
  }

  async softDelete(id: string): Promise<StudentGraduation> {
    return this.prisma.studentGraduation.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
