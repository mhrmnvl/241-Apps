import { Injectable } from '@nestjs/common';
import { Classroom, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import {
  resolveAcademicYearId,
  resolveSemesterId,
} from '../../../../shared/utils/active-academic-year.helper.js';
import {
  IClassroomRepository,
  ClassroomWithDetails,
  ClassroomEntity,
} from '../../domain/interfaces/classroom-repository.interface.js';
import {
  CLASSROOM_WITH_DETAILS_INCLUDE as CLASS_INCLUDE,
  classroomWithDetailsInclude,
} from './prisma-classroom.includes.js';
import type {
  ClassroomQueryInput,
  CreateClassroomRepositoryInput,
  UpdateClassroomRepositoryInput,
} from '../../domain/interfaces/classroom-repository.interface.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

@Injectable()
export class PrismaClassroomRepository extends IClassroomRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(
    query: ClassroomQueryInput,
  ): Promise<PaginatedResult<ClassroomWithDetails>> {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const { academicYearId, gradeId, search, isActive } = query;
    const skip = (page - 1) * limit;

    // Always resolve: with no explicit year the helper falls back to the
    // active one. Calling it only when a year was supplied would leave the
    // list unscoped and mix classrooms from every academic year together.
    const resolvedAcademicYearId = await resolveAcademicYearId(
      this.prisma,
      academicYearId,
    );

    // Which homeroom teacher counts as current is a period question, so it is
    // resolved here rather than left to whoever renders the column.
    const resolvedSemesterId = await resolveSemesterId(this.prisma, undefined);

    const where: Prisma.ClassroomWhereInput = {
      deletedAt: null,
      ...(resolvedAcademicYearId && { academicYearId: resolvedAcademicYearId }),
      ...(gradeId && { gradeId }),
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { code: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.classroom.findMany({
        where,
        include: classroomWithDetailsInclude(resolvedSemesterId),
        skip,
        take: limit,
        orderBy: [{ grade: { level: 'asc' } }, { code: 'asc' }],
      }),
      this.prisma.classroom.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<ClassroomWithDetails | null> {
    return this.prisma.classroom.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: CLASS_INCLUDE,
    });
  }

  async findDuplicate(
    code: string,
    academicYearId?: string,
    excludeId?: string,
  ): Promise<ClassroomEntity | null> {
    return this.prisma.classroom.findFirst({
      where: {
        code,
        ...(academicYearId && { academicYearId }),
        deletedAt: null,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
  }

  async create(
    data: CreateClassroomRepositoryInput,
  ): Promise<ClassroomWithDetails> {
    return this.prisma.classroom.create({ data, include: CLASS_INCLUDE });
  }

  async update(
    id: string,
    data: UpdateClassroomRepositoryInput,
  ): Promise<ClassroomWithDetails> {
    return this.prisma.classroom.update({
      where: { id },
      data,
      include: CLASS_INCLUDE,
    });
  }

  async findByCode(
    code: string,
    excludeId?: string,
  ): Promise<ClassroomEntity | null> {
    return this.prisma.classroom.findFirst({
      where: {
        code: { equals: code, mode: 'insensitive' },
        deletedAt: null,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
  }

  async findByName(
    name: string,
    academicYearId: string,
    excludeId?: string,
  ): Promise<ClassroomEntity | null> {
    return this.prisma.classroom.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        academicYearId,
        deletedAt: null,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
  }

  async findByAcademicYear(
    academicYearId: string,
  ): Promise<ClassroomWithDetails[]> {
    return this.prisma.classroom.findMany({
      where: {
        academicYearId,
        deletedAt: null,
      },
      include: CLASS_INCLUDE,
      orderBy: [{ grade: { level: 'asc' } }, { code: 'asc' }],
    });
  }

  async remove(id: string): Promise<Classroom> {
    return this.softDelete(id);
  }

  async softDelete(id: string): Promise<Classroom> {
    return this.prisma.classroom.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async countEnrollments(id: string): Promise<number> {
    return this.prisma.studentEnrollment.count({
      where: { classroomId: id, deletedAt: null },
    });
  }

  async countTeachingAssignments(id: string): Promise<number> {
    return this.prisma.teachingAssignment.count({
      where: { classroomId: id, deletedAt: null },
    });
  }
}
