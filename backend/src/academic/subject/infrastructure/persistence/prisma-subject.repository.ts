import { Injectable } from '@nestjs/common';
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
  SUBJECT_WITH_COUNT_INCLUDE,
  SubjectWithCount,
} from './prisma-subject.includes.js';

@Injectable()
export class PrismaSubjectRepository extends ISubjectRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(
    query: SubjectQueryInput,
  ): Promise<PaginatedResult<SubjectWithCount>> {
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

    const [data, total] = await Promise.all([
      this.prisma.subject.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: SUBJECT_WITH_COUNT_INCLUDE,
      }),
      this.prisma.subject.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<SubjectWithCount | null> {
    return this.prisma.subject.findFirst({
      where: { id, deletedAt: null },
      include: SUBJECT_WITH_COUNT_INCLUDE,
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
    const subject = await this.prisma.subject.create({
      data: {
        code: dto.code,
        name: dto.name,
      },
    });

    if (dto.teacherIds && dto.teacherIds.length > 0) {
      await this.syncTeachingAssignments(subject.id, dto.teacherIds);
    }

    return subject;
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

    if (dto.teacherIds !== undefined) {
      await this.syncTeachingAssignments(id, dto.teacherIds);
    }

    const updated = await this.findById(id);
    if (!updated) {
      throw new Error(`Subject with ID ${id} not found after update`);
    }
    return updated;
  }

  private async syncTeachingAssignments(
    subjectId: string,
    teacherIds: string[],
  ): Promise<void> {
    const activeSemester = await this.prisma.semester.findFirst({
      where: { isActive: true, deletedAt: null },
    });
    if (!activeSemester) return;

    const classrooms = await this.prisma.classroom.findMany({
      where: { deletedAt: null },
    });
    if (classrooms.length === 0) return;

    for (const classroom of classrooms) {
      for (const teacherId of teacherIds) {
        const existing = await this.prisma.teachingAssignment.findFirst({
          where: {
            teacherId,
            subjectId,
            classroomId: classroom.id,
            semesterId: activeSemester.id,
          },
        });

        if (existing) {
          if (existing.deletedAt) {
            await this.prisma.teachingAssignment.update({
              where: { id: existing.id },
              data: { deletedAt: null },
            });
          }
        } else {
          await this.prisma.teachingAssignment.create({
            data: {
              teacherId,
              subjectId,
              classroomId: classroom.id,
              semesterId: activeSemester.id,
            },
          });
        }
      }

      await this.prisma.teachingAssignment.updateMany({
        where: {
          subjectId,
          classroomId: classroom.id,
          semesterId: activeSemester.id,
          teacherId: { notIn: teacherIds },
          deletedAt: null,
        },
        data: { deletedAt: new Date() },
      });
    }
  }

  async remove(id: string): Promise<Subject> {
    await this.prisma.subject.updateMany({
      where: { id },
      data: { deletedAt: new Date() },
    });
    const deleted = await this.prisma.subject.findFirst({ where: { id } });
    if (!deleted) {
      throw new Error(`Subject with ID ${id} not found after deletion`);
    }
    return deleted;
  }
}
