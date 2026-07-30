import { Injectable } from '@nestjs/common';
import { Day, Prisma, Schedule } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { ScheduleQueryDto } from '../../dto/request/schedule.dto.js';
import {
  IScheduleRepository,
  SCHEDULE_INCLUDE,
  ScheduleWithDetails,
  CreateScheduleRepositoryInput,
  RestoreScheduleRepositoryInput,
} from '../../domain/interfaces/schedule-repository.interface.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

@Injectable()
export class PrismaScheduleRepository extends IScheduleRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(
    query: ScheduleQueryDto,
  ): Promise<PaginatedResult<ScheduleWithDetails>> {
    const {
      page = 1,
      limit = 10,
      teachingAssignmentId,
      day,
      timeSlotId,
    } = query;
    const skip = (page - 1) * limit;
    const where: Prisma.ScheduleWhereInput = {
      deletedAt: null,
      teachingAssignment: {
        classroom: { academicYear: { deletedAt: null } },
      },
      ...(teachingAssignmentId && { teachingAssignmentId }),
      ...(day && { day: day }),
      ...(timeSlotId && { timeSlotId }),
    };
    const [data, total] = await Promise.all([
      this.prisma.schedule.findMany({
        where,
        include: SCHEDULE_INCLUDE,
        skip,
        take: limit,
        orderBy: [{ day: 'asc' }, { timeSlot: { order: 'asc' } }],
      }),
      this.prisma.schedule.count({ where }),
    ]);
    return { data: data, total, page, limit };
  }

  async findById(id: string): Promise<ScheduleWithDetails | null> {
    const result = await this.prisma.schedule.findFirst({
      where: {
        id,
        deletedAt: null,
        teachingAssignment: {
          classroom: { academicYear: { deletedAt: null } },
        },
      },
      include: SCHEDULE_INCLUDE,
    });
    return result;
  }

  async findDuplicate(
    teachingAssignmentId: string,
    day: Day,
    timeSlotId: string,
    excludeId?: string,
  ): Promise<Schedule | null> {
    return this.prisma.schedule.findFirst({
      where: {
        teachingAssignmentId,
        day,
        timeSlotId,
        deletedAt: null,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
  }

  async create(
    data: CreateScheduleRepositoryInput,
  ): Promise<ScheduleWithDetails> {
    const result = await this.prisma.schedule.create({
      data: {
        teachingAssignmentId: data.teachingAssignmentId,
        timeSlotId: data.timeSlotId,
        day: data.day,
        room: data.room,
      },
      include: SCHEDULE_INCLUDE,
    });
    return result;
  }

  async update(
    id: string,
    data: Prisma.ScheduleUpdateInput,
  ): Promise<ScheduleWithDetails> {
    const result = await this.prisma.schedule.update({
      where: { id },
      data,
      include: SCHEDULE_INCLUDE,
    });
    return result;
  }

  async findSoftDeleted(
    teachingAssignmentId: string,
    day: Day,
    timeSlotId: string,
  ): Promise<Schedule | null> {
    return this.prisma.schedule.findFirst({
      where: {
        teachingAssignmentId,
        day,
        timeSlotId,
        deletedAt: { not: null },
      },
    });
  }

  async restore(
    id: string,
    data: RestoreScheduleRepositoryInput,
  ): Promise<ScheduleWithDetails> {
    const result = await this.prisma.schedule.update({
      where: { id },
      data: { ...data, deletedAt: null },
      include: SCHEDULE_INCLUDE,
    });
    return result;
  }

  async softDelete(id: string): Promise<Schedule> {
    return this.prisma.schedule.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findByClassroom(classroomId: string): Promise<ScheduleWithDetails[]> {
    const result = await this.prisma.schedule.findMany({
      where: {
        deletedAt: null,
        teachingAssignment: {
          classroomId,
          deletedAt: null,
          classroom: { academicYear: { deletedAt: null } },
        },
      },
      include: SCHEDULE_INCLUDE,
      orderBy: [{ day: 'asc' }, { timeSlot: { order: 'asc' } }],
    });
    return result;
  }

  async softDeleteByClassroomAndDay(
    classroomId: string,
    day: Day,
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.schedule.updateMany({
      where: {
        deletedAt: null,
        day,
        teachingAssignment: {
          classroomId,
          deletedAt: null,
          classroom: { academicYear: { deletedAt: null } },
        },
      },
      data: { deletedAt: new Date() },
    });
  }

  async findTeachingAssignmentById(id: string): Promise<{ id: string } | null> {
    return this.prisma.teachingAssignment.findFirst({
      where: {
        id,
        classroom: { academicYear: { deletedAt: null } },
        deletedAt: null,
      },
      select: { id: true },
    });
  }

  async findValidClassroomById(id: string): Promise<{ id: string } | null> {
    return this.prisma.classroom.findFirst({
      where: {
        id,
        academicYear: { deletedAt: null },
        deletedAt: null,
      },
      select: { id: true },
    });
  }

  async findActiveSemester(): Promise<{ id: string } | null> {
    return this.prisma.semester.findFirst({
      where: {
        isActive: true,
        deletedAt: null,
        academicYear: { deletedAt: null },
      },
      select: { id: true },
    });
  }

  async findTeachingAssignmentBySubjectAndSemester(
    classroomId: string,
    subjectId: string,
    semesterId: string,
  ): Promise<{ id: string } | null> {
    return this.prisma.teachingAssignment.findFirst({
      where: {
        classroomId,
        subjectId,
        semesterId,
        deletedAt: null,
      },
      select: { id: true },
    });
  }

  async findAnyTeacherIdForSubject(subjectId: string): Promise<string | null> {
    const res = await this.prisma.teachingAssignment.findFirst({
      where: { subjectId, deletedAt: null },
      select: { teacherId: true },
    });
    return res?.teacherId ?? null;
  }

  async createTeachingAssignment(data: {
    classroomId: string;
    subjectId: string;
    teacherId: string;
    semesterId: string;
  }): Promise<{ id: string }> {
    return this.prisma.teachingAssignment.create({
      data,
      select: { id: true },
    });
  }
}
