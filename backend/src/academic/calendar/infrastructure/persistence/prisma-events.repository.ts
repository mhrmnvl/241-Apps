import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { CreateEventDto } from '../../dto/request/create-event.dto.js';
import { EventQueryDto } from '../../dto/request/event-query.dto.js';
import { UpdateEventDto } from '../../dto/request/update-event.dto.js';
import {
  IEventRepository,
  EVENT_INCLUDE,
  EventWithDetails,
} from '../../domain/interfaces/events-repository.interface.js';

@Injectable()
export class PrismaEventRepository extends IEventRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(query: EventQueryDto) {
    const {
      page = 1,
      limit = 10,
      classroomId,
      audienceGroupId,
      search,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.EventWhereInput = {
      deletedAt: null,
      ...(classroomId && {
        classrooms: { some: { classroomId } },
      }),
      ...(audienceGroupId && {
        audiences: { some: { audienceGroupId } },
      }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        include: EVENT_INCLUDE,
        skip,
        take: limit,
        orderBy: { startTime: 'desc' },
      }),
      this.prisma.event.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string) {
    return this.prisma.event.findFirst({
      where: { id, deletedAt: null },
      include: EVENT_INCLUDE,
    });
  }

  async create(dto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        title: dto.title,
        description: dto.description,
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
        ...(dto.classroomIds?.length && {
          classrooms: {
            create: dto.classroomIds.map((classroomId) => ({ classroomId })),
          },
        }),
        ...(dto.audienceGroupIds?.length && {
          audiences: {
            create: dto.audienceGroupIds.map((audienceGroupId) => ({
              audienceGroupId,
            })),
          },
        }),
      },
      include: EVENT_INCLUDE,
    });
  }

  async update(id: string, dto: UpdateEventDto) {
    return this.prisma.event.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description && { description: dto.description }),
        ...(dto.startTime && { startTime: new Date(dto.startTime) }),
        ...(dto.endTime && { endTime: new Date(dto.endTime) }),
        ...(dto.classroomIds !== undefined && {
          classrooms: {
            deleteMany: {},
            ...(dto.classroomIds.length > 0 && {
              create: dto.classroomIds.map((classroomId) => ({ classroomId })),
            }),
          },
        }),
        ...(dto.audienceGroupIds !== undefined && {
          audiences: {
            deleteMany: {},
            ...(dto.audienceGroupIds.length > 0 && {
              create: dto.audienceGroupIds.map((audienceGroupId) => ({
                audienceGroupId,
              })),
            }),
          },
        }),
      },
      include: EVENT_INCLUDE,
    });
  }

  async softDelete(id: string) {
    return this.prisma.event.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findAllAudienceGroups() {
    const groups = await this.prisma.audienceGroup.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
    return groups.map((g) => ({
      id: g.id,
      name: g.name,
      description: null,
    }));
  }
}
