import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import {
  IAnnouncementRepository,
  AnnouncementQueryInput,
} from '../../domain/interfaces/announcement-repository.interface.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';
import {
  ANNOUNCEMENT_INCLUDE,
  AnnouncementWithDetails,
} from './prisma-announcement.includes.js';

@Injectable()
export class PrismaAnnouncementRepository extends IAnnouncementRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(
    query: AnnouncementQueryInput,
  ): Promise<PaginatedResult<AnnouncementWithDetails>> {
    const { page = 1, limit = 10, classroomId, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.AnnouncementWhereInput = {
      deletedAt: null,
      ...(classroomId && {
        classrooms: { some: { classroomId } },
      }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.announcement.findMany({
        where,
        include: ANNOUNCEMENT_INCLUDE,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      this.prisma.announcement.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<AnnouncementWithDetails | null> {
    return this.prisma.announcement.findFirst({
      where: { id, deletedAt: null },
      include: ANNOUNCEMENT_INCLUDE,
    });
  }

  async create(data: {
    title: string;
    description: string;
    date: Date;
    classroomIds?: string[];
  }): Promise<AnnouncementWithDetails> {
    return this.prisma.announcement.create({
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        ...(data.classroomIds?.length && {
          classrooms: {
            create: data.classroomIds.map((classroomId) => ({ classroomId })),
          },
        }),
      },
      include: ANNOUNCEMENT_INCLUDE,
    });
  }

  async update(
    id: string,
    data: { title?: string; description?: string; date?: Date },
    classroomIds?: string[],
  ): Promise<AnnouncementWithDetails> {
    return this.prisma.announcement.update({
      where: { id },
      data: {
        ...data,
        ...(classroomIds !== undefined && {
          classrooms: {
            deleteMany: {},
            ...(classroomIds.length > 0 && {
              create: classroomIds.map((classroomId) => ({ classroomId })),
            }),
          },
        }),
      },
      include: ANNOUNCEMENT_INCLUDE,
    });
  }

  async softDelete(id: string) {
    return this.prisma.announcement.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
