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
  GraduationCandidateList,
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
   * Students eligible to graduate, from the active academic year.
   *
   * The year, not the semester. Graduation is a year-end act and
   * `StudentGraduation` records a year, so keying candidates on a semester
   * would key them on something finer than the record they produce — and would
   * find nobody whenever the semester flagged active is not the one the
   * students are enrolled in, which is exactly the state this school is in
   * today: every enrolment sits in Genap while Ganjil holds the active flag.
   *
   * Nothing is asked of the operator. A school has one active year, and
   * requiring someone to name it is asking them to restate what the system
   * knows — with a chance of naming the wrong one, which here means graduating
   * the wrong cohort.
   *
   * "Final grade" is the highest level among that year's classrooms, so it is
   * IX for an MTs, XII for an SMA and VI for an SD without anyone configuring
   * it, and it shifts on its own if the school adds a level. The promotion
   * recommendation derives it the same way to decide who it must leave out, so
   * the two cannot disagree about who is in the last year.
   *
   * Anyone already holding a graduation record is filtered out here, so the
   * screen never offers a student it would then skip.
   */
  async findCandidates(): Promise<GraduationCandidateList> {
    const academicYear = await this.prisma.academicYear.findFirst({
      where: { isActive: true, deletedAt: null },
      select: { id: true, name: true },
    });
    if (!academicYear) {
      return { academicYear: null, finalGradeName: null, students: [] };
    }

    const term = { id: academicYear.id, name: academicYear.name };

    const levels = await this.prisma.classroom.findMany({
      where: { academicYearId: academicYear.id, deletedAt: null },
      select: { grade: { select: { level: true, name: true } } },
    });
    if (levels.length === 0) {
      return { academicYear: term, finalGradeName: null, students: [] };
    }
    const finalLevel = Math.max(...levels.map((c) => c.grade.level));
    const finalGradeName =
      levels.find((c) => c.grade.level === finalLevel)?.grade.name ?? null;

    const enrollments = await this.prisma.studentEnrollment.findMany({
      where: {
        // Any semester of the year: which one carries the active flag is not
        // what decides whether a student is finishing school.
        semester: { academicYearId: academicYear.id, deletedAt: null },
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

    return {
      academicYear: term,
      finalGradeName,
      students: enrollments.map((e) => ({
        studentId: e.studentId,
        studentName: e.student.user?.profile?.name ?? '-',
        nis: e.student.nis,
        classroomId: e.classroom.id,
        classroomName: e.classroom.code,
        gradeName: e.classroom.grade.name,
      })),
    };
  }

  /** The year a bulk run files its graduations under. */
  async findActiveAcademicYearId(): Promise<string | null> {
    const year = await this.prisma.academicYear.findFirst({
      where: { isActive: true, deletedAt: null },
      select: { id: true },
    });
    return year?.id ?? null;
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
