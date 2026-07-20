import { Injectable } from '@nestjs/common';
import {
  Classroom,
  ClassroomStructure,
  Prisma,
  Semester,
  StudentEnrollment,
} from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { resolveSemesterId } from '../../../../shared/utils/active-academic-year.helper.js';
import {
  IClassroomStructuresRepository,
  CLASSROOM_STRUCTURE_INCLUDE,
  ClassroomStructureWithDetails,
  StudentSemesterStructureResult,
  CreateClassroomStructureRepositoryInput,
  UpdateClassroomStructureRepositoryInput,
} from '../../domain/interfaces/classroom-structures-repository.interface.js';
import { ClassroomStructureQueryDto } from '../../dto/request/classroom-structure-query.dto.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

@Injectable()
export class PrismaClassroomStructuresRepository extends IClassroomStructuresRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(
    query: ClassroomStructureQueryDto,
  ): Promise<PaginatedResult<ClassroomStructureWithDetails>> {
    const { page = 1, limit = 10, classroomId, semesterId } = query;
    const skip = (page - 1) * limit;

    const resolvedSemesterId = await resolveSemesterId(this.prisma, semesterId);

    const where: Prisma.ClassroomStructureWhereInput = {
      deletedAt: null,
      ...(classroomId && { classroomId }),
      ...(resolvedSemesterId && { semesterId: resolvedSemesterId }),
    };

    const [data, total] = await Promise.all([
      this.prisma.classroomStructure.findMany({
        where,
        include: CLASSROOM_STRUCTURE_INCLUDE,
        skip,
        take: limit,
        orderBy: { classroomId: 'asc' },
      }),
      this.prisma.classroomStructure.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<ClassroomStructureWithDetails | null> {
    return this.prisma.classroomStructure.findFirst({
      where: { id, deletedAt: null },
      include: CLASSROOM_STRUCTURE_INCLUDE,
    });
  }

  async findByClassroomAndSemester(
    classroomId: string,
    semesterId: string,
  ): Promise<ClassroomStructureWithDetails | null> {
    return this.prisma.classroomStructure.findFirst({
      where: { classroomId, semesterId, deletedAt: null },
      include: CLASSROOM_STRUCTURE_INCLUDE,
    });
  }

  async findClassroomById(id: string): Promise<Classroom | null> {
    return this.prisma.classroom.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findSemesterById(id: string): Promise<Semester | null> {
    return this.prisma.semester.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findActiveEnrollment(
    studentId: string,
    classroomId: string,
    semesterId: string,
  ): Promise<StudentEnrollment | null> {
    return this.prisma.studentEnrollment.findFirst({
      where: {
        studentId,
        classroomId,
        semesterId,
        status: 'ACTIVE',
        deletedAt: null,
      },
    });
  }

  async findByStudentAndSemester(
    studentId: string,
    semesterId: string,
  ): Promise<StudentSemesterStructureResult | null> {
    const structure = await this.prisma.classroomStructure.findFirst({
      where: {
        semesterId,
        deletedAt: null,
        OR: [
          { presidentId: studentId },
          { vicePresidentId: studentId },
          { secretaryId: studentId },
          { treasurerId: studentId },
        ],
      },
      include: { classroom: { select: { code: true } } },
    });
    return structure;
  }

  async create(
    data: CreateClassroomStructureRepositoryInput,
  ): Promise<ClassroomStructureWithDetails> {
    return this.prisma.classroomStructure.create({
      data,
      include: CLASSROOM_STRUCTURE_INCLUDE,
    });
  }

  async update(
    id: string,
    data: UpdateClassroomStructureRepositoryInput,
  ): Promise<ClassroomStructureWithDetails> {
    return this.prisma.classroomStructure.update({
      where: { id },
      data,
      include: CLASSROOM_STRUCTURE_INCLUDE,
    });
  }

  async softDelete(id: string): Promise<ClassroomStructure> {
    return this.prisma.classroomStructure.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
