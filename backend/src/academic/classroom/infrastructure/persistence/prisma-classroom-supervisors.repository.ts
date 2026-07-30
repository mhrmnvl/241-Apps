import { Injectable } from '@nestjs/common';
import { ClassroomSupervisor, Prisma, Teacher } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { resolveSemesterId } from '../../../../shared/utils/active-academic-year.helper.js';
import {
  IClassroomSupervisorRepository,
  CLASS_SUPERVISOR_INCLUDE,
  ClassroomSupervisorWithDetails,
  ClassroomWithAcademicYear,
  SemesterWithAcademicYear,
  CreateClassroomSupervisorRepositoryInput,
  UpdateClassroomSupervisorRepositoryInput,
  RestoreClassroomSupervisorRepositoryInput,
} from '../../domain/interfaces/classroom-supervisors-repository.interface.js';
import { ClassroomSupervisorQueryDto } from '../../dto/request/classroom-supervisor-query.dto.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

@Injectable()
export class PrismaClassroomSupervisorRepository extends IClassroomSupervisorRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(
    query: ClassroomSupervisorQueryDto,
  ): Promise<PaginatedResult<ClassroomSupervisorWithDetails>> {
    const { page = 1, limit = 10, classroomId, teacherId, semesterId } = query;
    const skip = (page - 1) * limit;

    const resolvedSemesterId = await resolveSemesterId(this.prisma, semesterId);

    const where: Prisma.ClassroomSupervisorWhereInput = {
      deletedAt: null,
      ...(classroomId && { classroomId }),
      ...(teacherId && { teacherId }),
      ...(resolvedSemesterId && { semesterId: resolvedSemesterId }),
    };

    const [data, total] = await Promise.all([
      this.prisma.classroomSupervisor.findMany({
        where,
        include: CLASS_SUPERVISOR_INCLUDE,
        skip,
        take: limit,
        orderBy: [{ semester: { academicYear: { name: 'desc' } } }],
      }),
      this.prisma.classroomSupervisor.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<ClassroomSupervisorWithDetails | null> {
    return this.prisma.classroomSupervisor.findFirst({
      where: { id, deletedAt: null },
      include: CLASS_SUPERVISOR_INCLUDE,
    });
  }

  async findByClassroomAndSemester(
    classroomId: string,
    semesterId: string,
  ): Promise<ClassroomSupervisor | null> {
    return this.prisma.classroomSupervisor.findFirst({
      where: { classroomId, semesterId, deletedAt: null },
    });
  }

  async findClassroomById(
    id: string,
  ): Promise<ClassroomWithAcademicYear | null> {
    return this.prisma.classroom.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, academicYearId: true },
    });
  }

  async findTeacherById(id: string): Promise<Teacher | null> {
    return this.prisma.teacher.findFirst({ where: { id, deletedAt: null } });
  }

  async findSemesterById(id: string): Promise<SemesterWithAcademicYear | null> {
    return this.prisma.semester.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, academicYearId: true },
    });
  }

  async create(
    data: CreateClassroomSupervisorRepositoryInput,
  ): Promise<ClassroomSupervisorWithDetails> {
    return this.prisma.classroomSupervisor.create({
      data,
      include: CLASS_SUPERVISOR_INCLUDE,
    });
  }

  async update(
    id: string,
    data: UpdateClassroomSupervisorRepositoryInput,
  ): Promise<ClassroomSupervisorWithDetails> {
    return this.prisma.classroomSupervisor.update({
      where: { id },
      data,
      include: CLASS_SUPERVISOR_INCLUDE,
    });
  }

  async findSoftDeletedByClassroomAndSemester(
    classroomId: string,
    semesterId: string,
  ): Promise<ClassroomSupervisor | null> {
    return this.prisma.classroomSupervisor.findFirst({
      where: { classroomId, semesterId, deletedAt: { not: null } },
    });
  }

  async restore(
    id: string,
    data: RestoreClassroomSupervisorRepositoryInput,
  ): Promise<ClassroomSupervisorWithDetails> {
    return this.prisma.classroomSupervisor.update({
      where: { id },
      data: { ...data, deletedAt: null },
      include: CLASS_SUPERVISOR_INCLUDE,
    });
  }

  async softDelete(id: string): Promise<ClassroomSupervisor> {
    return this.prisma.classroomSupervisor.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
