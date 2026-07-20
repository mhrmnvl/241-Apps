import { Injectable } from '@nestjs/common';
import { Prisma, TeachingAssignment } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { TeachingAssignmentQueryDto } from '../../dto/request/teaching-assignment-query.dto.js';
import { resolveSemesterId } from '../../../../shared/utils/active-academic-year.helper.js';
import {
  ITeachingAssignmentRepository,
  TEACHING_ASSIGNMENT_INCLUDE,
  TeachingAssignmentWithDetails,
  ClassroomReference,
  SemesterReference,
  CreateTeachingAssignmentRepositoryInput,
  UpdateTeachingAssignmentRepositoryInput,
  RestoreTeachingAssignmentRepositoryInput,
} from '../../domain/interfaces/teaching-assignment-repository.interface.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

@Injectable()
export class PrismaTeachingAssignmentRepository extends ITeachingAssignmentRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(
    query: TeachingAssignmentQueryDto,
  ): Promise<PaginatedResult<TeachingAssignmentWithDetails>> {
    const {
      page = 1,
      limit = 10,
      teacherId,
      classroomId,
      subjectId,
      semesterId,
    } = query;
    const skip = (page - 1) * limit;

    const resolvedSemesterId = await resolveSemesterId(this.prisma, semesterId);

    const where: Prisma.TeachingAssignmentWhereInput = {
      deletedAt: null,
      ...(teacherId && { teacherId }),
      ...(classroomId && { classroomId }),
      ...(subjectId && { subjectId }),
      ...(resolvedSemesterId && { semesterId: resolvedSemesterId }),
    };

    const [data, total] = await Promise.all([
      this.prisma.teachingAssignment.findMany({
        where,
        include: TEACHING_ASSIGNMENT_INCLUDE,
        skip,
        take: limit,
        orderBy: { classroom: { name: 'asc' } },
      }),
      this.prisma.teachingAssignment.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findById(id: string): Promise<TeachingAssignmentWithDetails | null> {
    return this.prisma.teachingAssignment.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: TEACHING_ASSIGNMENT_INCLUDE,
    });
  }

  async findDuplicate(
    teacherId: string,
    classroomId: string,
    subjectId: string,
    semesterId: string,
    excludeId?: string,
  ): Promise<TeachingAssignment | null> {
    return this.prisma.teachingAssignment.findFirst({
      where: {
        teacherId,
        classroomId,
        subjectId,
        semesterId,
        deletedAt: null,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
  }

  async create(
    data: CreateTeachingAssignmentRepositoryInput,
  ): Promise<TeachingAssignmentWithDetails> {
    return this.prisma.teachingAssignment.create({
      data,
      include: TEACHING_ASSIGNMENT_INCLUDE,
    });
  }

  async update(
    id: string,
    data: UpdateTeachingAssignmentRepositoryInput,
  ): Promise<TeachingAssignmentWithDetails> {
    return this.prisma.teachingAssignment.update({
      where: { id },
      data,
      include: TEACHING_ASSIGNMENT_INCLUDE,
    });
  }

  async findSoftDeleted(
    teacherId: string,
    classroomId: string,
    subjectId: string,
    semesterId: string,
  ): Promise<TeachingAssignment | null> {
    return this.prisma.teachingAssignment.findFirst({
      where: {
        teacherId,
        classroomId,
        subjectId,
        semesterId,
        deletedAt: { not: null },
      },
    });
  }

  async restore(
    id: string,
    data: RestoreTeachingAssignmentRepositoryInput,
  ): Promise<TeachingAssignmentWithDetails> {
    return this.prisma.teachingAssignment.update({
      where: { id },
      data: { ...data, deletedAt: null },
      include: TEACHING_ASSIGNMENT_INCLUDE,
    });
  }

  async softDelete(id: string): Promise<TeachingAssignment> {
    return this.prisma.teachingAssignment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findClassroomById(id: string): Promise<ClassroomReference | null> {
    return this.prisma.classroom.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, academicYearId: true },
    });
  }

  async findSemesterById(id: string): Promise<SemesterReference | null> {
    return this.prisma.semester.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, academicYearId: true },
    });
  }
}
