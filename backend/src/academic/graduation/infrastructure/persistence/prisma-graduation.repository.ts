import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, StudentGraduation, StudentStatus } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { CreateStudentGraduationDto } from '../../dto/request/create-student-graduation.dto.js';
import { StudentGraduationQueryDto } from '../../dto/request/student-graduation-query.dto.js';
import { UpdateStudentGraduationDto } from '../../dto/request/update-student-graduation.dto.js';
import { resolveAcademicYearId } from '../../../../shared/utils/active-academic-year.helper.js';
import {
  IGraduationRepository,
  GRADUATION_INCLUDE,
  StudentGraduationWithDetails,
} from '../../domain/interfaces/graduation-repository.interface.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

@Injectable()
export class PrismaGraduationRepository extends IGraduationRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(
    query: StudentGraduationQueryDto,
  ): Promise<PaginatedResult<StudentGraduationWithDetails>> {
    const { page = 1, limit = 10, academicYearId, search } = query;
    const skip = (page - 1) * limit;

    const resolvedAcademicYearId = academicYearId
      ? await resolveAcademicYearId(this.prisma, academicYearId)
      : undefined;

    const where: Prisma.StudentGraduationWhereInput = {
      deletedAt: null,
      ...(resolvedAcademicYearId && { academicYearId: resolvedAcademicYearId }),
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
        include: GRADUATION_INCLUDE,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.studentGraduation.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<StudentGraduationWithDetails | null> {
    return this.prisma.studentGraduation.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: GRADUATION_INCLUDE,
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
    dto: CreateStudentGraduationDto,
  ): Promise<StudentGraduationWithDetails> {
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
        include: GRADUATION_INCLUDE,
      });

      await tx.student.update({
        where: { id: dto.studentId },
        data: { status: StudentStatus.GRADUATED },
      });

      return graduation;
    });
  }

  async update(
    id: string,
    dto: UpdateStudentGraduationDto,
  ): Promise<StudentGraduationWithDetails> {
    const { studentId, academicYearId, graduationDate, ...rest } = dto;
    return this.prisma.studentGraduation.update({
      where: { id },
      data: {
        ...rest,
        ...(studentId && { studentId }),
        ...(academicYearId && { academicYearId }),
        ...(graduationDate && { graduationDate: new Date(graduationDate) }),
      },
      include: GRADUATION_INCLUDE,
    });
  }

  async softDelete(id: string): Promise<StudentGraduation> {
    return this.prisma.studentGraduation.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
