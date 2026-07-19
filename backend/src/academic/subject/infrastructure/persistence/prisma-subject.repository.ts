import { Injectable } from '@nestjs/common';
import { Prisma, Subject } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { CreateSubjectDto } from '../../dto/create-subject.dto.js';
import { SubjectQueryDto } from '../../dto/subject-query.dto.js';
import { UpdateSubjectDto } from '../../dto/update-subject.dto.js';
import {
  ISubjectRepository,
  SUBJECT_LIST_INCLUDE,
  SubjectWithDetails,
} from '../../domain/interfaces/subject-repository.interface.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

@Injectable()
export class PrismaSubjectRepository extends ISubjectRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(
    query: SubjectQueryDto,
  ): Promise<PaginatedResult<SubjectWithDetails>> {
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
        include: SUBJECT_LIST_INCLUDE,
      }),
      this.prisma.subject.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<Subject | null> {
    return this.prisma.subject.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByName(name: string): Promise<Subject | null> {
    return this.prisma.subject.findFirst({
      where: { name, deletedAt: null },
    });
  }

  async create(dto: CreateSubjectDto): Promise<Subject> {
    return this.prisma.subject.create({
      data: {
        code: dto.code,
        name: dto.name,
      },
    });
  }

  async update(id: string, dto: UpdateSubjectDto): Promise<Subject> {
    await this.prisma.subject.updateMany({
      where: { id },
      data: {
        ...(dto.code !== undefined && { code: dto.code }),
        ...(dto.name && { name: dto.name }),
      },
    });
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error(`Subject with ID ${id} not found after update`);
    }
    return updated;
  }

  async remove(id: string): Promise<Subject> {
    await this.prisma.subject.updateMany({
      where: { id },
      data: { deletedAt: new Date() },
    });
    const deleted = await this.findById(id);
    if (!deleted) {
      throw new Error(`Subject with ID ${id} not found after deletion`);
    }
    return deleted;
  }
}
