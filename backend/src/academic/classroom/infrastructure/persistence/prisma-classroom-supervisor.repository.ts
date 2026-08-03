import { Injectable } from '@nestjs/common';
import { ClassroomSupervisor, Prisma, Teacher } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { resolveSemesterId } from '../../../../shared/utils/active-academic-year.helper.js';
import { ClassroomSupervisorEntity } from '../../domain/entities/classroom-supervisor.entity.js';
import {
  IClassroomSupervisorRepository,
  SupervisorWithDetails,
} from '../../domain/interfaces/classroom-supervisor-repository.interface.js';
import { CLASSROOM_SUPERVISOR_WITH_DETAILS_INCLUDE as CLASS_SUPERVISOR_INCLUDE } from './prisma-classroom.includes.js';
import type {
  ClassroomSupervisorQueryInput,
  CreateClassroomSupervisorRepositoryInput,
  UpdateClassroomSupervisorRepositoryInput,
} from '../../domain/interfaces/classroom-supervisor-repository.interface.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

@Injectable()
export class PrismaClassroomSupervisorRepository extends IClassroomSupervisorRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(
    query: ClassroomSupervisorQueryInput,
  ): Promise<PaginatedResult<SupervisorWithDetails>> {
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

  async findById(id: string): Promise<SupervisorWithDetails | null> {
    return this.prisma.classroomSupervisor.findFirst({
      where: { id, deletedAt: null },
      include: CLASS_SUPERVISOR_INCLUDE,
    });
  }

  async findAssignment(
    classroomId: string,
    semesterId: string,
    excludeId?: string,
  ): Promise<ClassroomSupervisorEntity | null> {
    return this.prisma.classroomSupervisor.findFirst({
      where: {
        classroomId,
        semesterId,
        deletedAt: null,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
  }

  async findTeacherAssignment(
    teacherId: string,
    semesterId: string,
    excludeId?: string,
  ): Promise<ClassroomSupervisorEntity | null> {
    return this.prisma.classroomSupervisor.findFirst({
      where: {
        teacherId,
        semesterId,
        deletedAt: null,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
  }

  async findTeacherById(id: string): Promise<{ id: string } | null> {
    return this.prisma.teacher.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });
  }

  async create(
    data: CreateClassroomSupervisorRepositoryInput,
  ): Promise<SupervisorWithDetails> {
    return this.prisma.classroomSupervisor.create({
      data,
      include: CLASS_SUPERVISOR_INCLUDE,
    });
  }

  async update(
    id: string,
    data: UpdateClassroomSupervisorRepositoryInput,
  ): Promise<SupervisorWithDetails> {
    return this.prisma.classroomSupervisor.update({
      where: { id },
      data,
      include: CLASS_SUPERVISOR_INCLUDE,
    });
  }

  async remove(id: string): Promise<ClassroomSupervisorEntity> {
    return this.prisma.classroomSupervisor.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
