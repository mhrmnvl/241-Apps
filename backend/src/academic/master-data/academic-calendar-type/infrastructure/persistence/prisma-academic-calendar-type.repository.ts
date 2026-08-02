import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/database/prisma.service.js';
import type {
  AcademicCalendarTypeQueryInput,
  CreateAcademicCalendarTypeRepositoryInput,
  UpdateAcademicCalendarTypeRepositoryInput,
} from '../../domain/interfaces/academic-calendar-type-repository.interface.js';
import { IAcademicCalendarTypeRepository } from '../../domain/interfaces/academic-calendar-type-repository.interface.js';

@Injectable()
export class PrismaAcademicCalendarTypeRepository extends IAcademicCalendarTypeRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(query: AcademicCalendarTypeQueryInput) {
    const { page = 1, limit = 10, search, isActive } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.AcademicCalendarTypeWhereInput = {
      deletedAt: null,
      ...(isActive !== undefined && { isActive }),
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
    };

    const [data, total] = await Promise.all([
      this.prisma.academicCalendarType.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.academicCalendarType.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string) {
    return this.prisma.academicCalendarType.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByName(name: string, excludeId?: string) {
    return this.prisma.academicCalendarType.findFirst({
      where: {
        name,
        deletedAt: null,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
  }

  async create(data: { name: string; isActive?: boolean }) {
    return this.prisma.academicCalendarType.create({ data });
  }

  async update(id: string, data: Prisma.AcademicCalendarTypeUpdateInput) {
    return this.prisma.academicCalendarType.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string) {
    return this.prisma.academicCalendarType.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}
