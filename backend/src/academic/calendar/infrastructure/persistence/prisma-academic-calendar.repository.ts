import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import type {
  AcademicCalendarQueryInput,
  CreateAcademicCalendarRepositoryInput,
  UpdateAcademicCalendarRepositoryInput,
} from '../../domain/interfaces/academic-calendar-repository.interface.js';
import { IAcademicCalendarRepository } from '../../domain/interfaces/academic-calendar-repository.interface.js';
import { CALENDAR_WITH_DETAILS_INCLUDE as ACADEMIC_CALENDAR_INCLUDE } from './prisma-calendar.includes.js';

@Injectable()
export class PrismaAcademicCalendarRepository extends IAcademicCalendarRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(query: AcademicCalendarQueryInput) {
    const { page = 1, limit = 50, academicYearId, semesterId, typeId } = query;
    const skip = (page - 1) * limit;

    const resolvedAcademicYearId = academicYearId;

    const where: Prisma.AcademicCalendarWhereInput = {
      deletedAt: null,
      ...(resolvedAcademicYearId && { academicYearId: resolvedAcademicYearId }),
      ...(semesterId && { semesterId }),
      ...(typeId && { typeId }),
    };

    const [data, total] = await Promise.all([
      this.prisma.academicCalendar.findMany({
        where,
        include: ACADEMIC_CALENDAR_INCLUDE,
        skip,
        take: limit,
        orderBy: [{ startDate: 'asc' }],
      }),
      this.prisma.academicCalendar.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string) {
    return this.prisma.academicCalendar.findFirst({
      where: { id, deletedAt: null },
      include: ACADEMIC_CALENDAR_INCLUDE,
    });
  }

  async create(dto: CreateAcademicCalendarRepositoryInput) {
    return this.prisma.academicCalendar.create({
      data: {
        academicYearId: dto.academicYearId,
        semesterId: dto.semesterId,
        title: dto.title,
        typeId: dto.typeId,
        startDate: dto.startDate,
        endDate: dto.endDate,
        description: dto.description,
        ...(dto.classroomIds?.length && {
          classrooms: {
            create: dto.classroomIds.map((classroomId) => ({ classroomId })),
          },
        }),
      },
      include: ACADEMIC_CALENDAR_INCLUDE,
    });
  }

  async update(id: string, dto: UpdateAcademicCalendarRepositoryInput) {
    return this.prisma.academicCalendar.update({
      where: { id },
      data: {
        ...(dto.semesterId !== undefined && { semesterId: dto.semesterId }),
        ...(dto.title && { title: dto.title }),
        ...(dto.typeId && { typeId: dto.typeId }),
        ...(dto.startDate && { startDate: dto.startDate }),
        ...(dto.endDate && { endDate: dto.endDate }),
        ...(dto.description !== undefined && { description: dto.description }),
        // Replaced wholesale, not merged: a class removed from an entry has to
        // be expressible, and merging makes removal impossible. `undefined`
        // leaves the targeting alone, so an edit that touches only the title
        // does not silently make the entry school-wide.
        ...(dto.classroomIds !== undefined && {
          classrooms: {
            deleteMany: {},
            create: dto.classroomIds.map((classroomId) => ({ classroomId })),
          },
        }),
      },
      include: ACADEMIC_CALENDAR_INCLUDE,
    });
  }

  async remove(id: string) {
    return this.softDelete(id);
  }

  async softDelete(id: string) {
    return this.prisma.academicCalendar.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
