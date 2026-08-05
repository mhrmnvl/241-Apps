import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Subject } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import type {
  SubjectQueryInput,
  CreateSubjectRepositoryInput,
  UpdateSubjectRepositoryInput,
} from '../../domain/interfaces/subject-repository.interface.js';
import { ISubjectRepository } from '../../domain/interfaces/subject-repository.interface.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';
import {
  buildSubjectInclude,
  SubjectWithTeachers,
} from './prisma-subject.includes.js';

@Injectable()
export class PrismaSubjectRepository extends ISubjectRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  /**
   * Teaching assignments are per-semester, so every read resolves the active
   * semester first and shows only that semester's teachers.
   */
  private async activeSemesterId(): Promise<string | null> {
    const semester = await this.prisma.semester.findFirst({
      where: { isActive: true, deletedAt: null },
      select: { id: true },
    });
    return semester?.id ?? null;
  }

  async findAll(
    query: SubjectQueryInput,
  ): Promise<PaginatedResult<SubjectWithTeachers>> {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.SubjectWhereInput = {
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const include = buildSubjectInclude(await this.activeSemesterId());

    const [data, total] = await Promise.all([
      this.prisma.subject.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include,
      }),
      this.prisma.subject.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<SubjectWithTeachers | null> {
    const include = buildSubjectInclude(await this.activeSemesterId());
    return this.prisma.subject.findFirst({
      where: { id, deletedAt: null },
      include,
    });
  }

  async findByCode(code: string, excludeId?: string): Promise<Subject | null> {
    return this.prisma.subject.findFirst({
      where: {
        code,
        deletedAt: null,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
  }

  async findByName(name: string, excludeId?: string): Promise<Subject | null> {
    return this.prisma.subject.findFirst({
      where: {
        name,
        deletedAt: null,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
  }

  async countActiveAssignments(id: string): Promise<number> {
    return this.prisma.teachingAssignment.count({
      where: { subjectId: id, deletedAt: null },
    });
  }

  async create(dto: CreateSubjectRepositoryInput): Promise<Subject> {
    return this.prisma.subject.create({
      data: {
        code: dto.code,
        name: dto.name,
      },
    });
  }

  async update(
    id: string,
    dto: UpdateSubjectRepositoryInput,
  ): Promise<Subject> {
    await this.prisma.subject.updateMany({
      where: { id },
      data: {
        ...(dto.code !== undefined && { code: dto.code }),
        ...(dto.name && { name: dto.name }),
      },
    });

    const updated = await this.findById(id);
    if (!updated) {
      throw new NotFoundException(
        `Subject with ID ${id} not found after update`,
      );
    }
    return updated;
  }

  async remove(id: string): Promise<Subject> {
    await this.prisma.subject.updateMany({
      where: { id },
      data: { deletedAt: new Date() },
    });
    const deleted = await this.prisma.subject.findFirst({ where: { id } });
    if (!deleted) {
      throw new NotFoundException(
        `Subject with ID ${id} not found after deletion`,
      );
    }
    return deleted;
  }
}
