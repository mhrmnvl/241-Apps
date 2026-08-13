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

      const graduation = await tx.studentGraduation.create({
        data: {
          studentId: dto.studentId,
          academicYearId: dto.academicYearId,
          ...(dto.graduationDate && {
            graduationDate: new Date(dto.graduationDate),
          }),
          ...(dto.certificateNo && { certificateNo: dto.certificateNo }),
          ...(dto.note && { note: dto.note }),
        },
        include: GRADUATION_WITH_DETAILS_INCLUDE,
      });

      await tx.student.update({
        where: { id: dto.studentId },
        data: { status: StudentStatus.GRADUATED },
      });

      // Closing the enrolment is part of graduating, not a separate errand.
      //
      // This path used to create the record and mark the student, and leave the
      // enrolment open — so an alumnus stayed on their old class roster, and in
      // its attendance and grading lists, indefinitely. The promotion flow's own
      // graduation step always closed it; the two only differed because nothing
      // made them agree.
      await tx.studentEnrollment.updateMany({
        where: {
          studentId: dto.studentId,
          status: EnrollmentStatus.ACTIVE,
          deletedAt: null,
        },
        data: {
          status: EnrollmentStatus.GRADUATED,
          endedAt: new Date(),
        },
      });

      return graduation;
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

  async softDelete(id: string): Promise<StudentGraduation> {
    return this.prisma.studentGraduation.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
