import { Injectable } from '@nestjs/common';
import { ClassroomStructure, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { resolveSemesterId } from '../../../../shared/utils/active-academic-year.helper.js';
import {
  ClassroomStructureEntity,
  StructureWithDetails,
} from '../../domain/entities/classroom-structure.entity.js';
import {
  IClassroomStructureRepository,
  ClassroomStructureWithDetails,
} from '../../domain/interfaces/classroom-structure-repository.interface.js';
import { CLASSROOM_STRUCTURE_WITH_DETAILS_INCLUDE as CLASSROOM_STRUCTURE_INCLUDE } from './prisma-classroom.includes.js';
import type {
  ClassroomStructureQueryInput,
  CreateClassroomStructureRepositoryInput,
  UpdateClassroomStructureRepositoryInput,
} from '../../domain/interfaces/classroom-structure-repository.interface.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

@Injectable()
export class PrismaClassroomStructureRepository extends IClassroomStructureRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(
    query: ClassroomStructureQueryInput,
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

  async findStructure(
    classroomId: string,
    semesterId: string,
    excludeId?: string,
  ): Promise<StructureWithDetails | null> {
    return this.prisma.classroomStructure.findFirst({
      where: {
        classroomId,
        semesterId,
        deletedAt: null,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
      include: CLASSROOM_STRUCTURE_INCLUDE,
    });
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

  async remove(id: string): Promise<ClassroomStructureEntity> {
    return this.softDelete(id);
  }

  async softDelete(id: string): Promise<ClassroomStructure> {
    return this.prisma.classroomStructure.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
